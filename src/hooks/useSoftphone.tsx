'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { useAuth } from '@/hooks/useAuth';

type DeviceStatus = 'uninitialized' | 'initializing' | 'ready' | 'error';
type CallState = 'idle' | 'ringing-incoming' | 'connecting' | 'in-call' | 'ending';

interface TwilioContextValue {
  status: DeviceStatus;
  callState: CallState;
  errorMessage: string | null;
  remoteIdentifier: string | null;          // who we're talking to / who is calling
  startCall: (to: string, opts?: { candidateId?: string }) => Promise<void>;
  acceptIncoming: () => void;
  rejectIncoming: () => void;
  hangup: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const TwilioContext = createContext<TwilioContextValue | null>(null);

export function useSoftphone(): TwilioContextValue {
  const ctx = useContext(TwilioContext);
  if (!ctx) throw new Error('useSoftphone must be used within <SoftphoneProvider>');
  return ctx;
}

export function SoftphoneProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const deviceRef = useRef<Device | null>(null);
  const activeCallRef = useRef<Call | null>(null);

  const [status, setStatus] = useState<DeviceStatus>('uninitialized');
  const [callState, setCallState] = useState<CallState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remoteIdentifier, setRemoteIdentifier] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // ── Wire call lifecycle events ─────────────────────────────────────────────
  const attachCallListeners = useCallback((call: Call) => {
    call.on('accept', () => {
      setCallState('in-call');
      setIsMuted(false);
    });
    call.on('disconnect', () => {
      setCallState('idle');
      setRemoteIdentifier(null);
      setIsMuted(false);
      activeCallRef.current = null;
    });
    call.on('cancel', () => {
      setCallState('idle');
      setRemoteIdentifier(null);
      activeCallRef.current = null;
    });
    call.on('reject', () => {
      setCallState('idle');
      setRemoteIdentifier(null);
      activeCallRef.current = null;
    });
    call.on('error', (e: { message?: string }) => {
      setErrorMessage(e?.message || 'Call error');
      setCallState('idle');
      setRemoteIdentifier(null);
      activeCallRef.current = null;
    });
  }, []);

  // ── Initialise the Device when the user logs in ───────────────────────────
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function init() {
      setStatus('initializing');
      setErrorMessage(null);
      try {
        const res = await api.get<ApiResponse<{ token: string; identity: string }>>('/voice/token');
        if (cancelled) return;

        const device = new Device(res.data.token, {
          // Use Opus codec for better audio quality
          codecPreferences: ['opus' as unknown as Call.Codec, 'pcmu' as unknown as Call.Codec],
          logLevel: 'warn',
        });

        device.on('registered', () => setStatus('ready'));
        device.on('error', (e: { message?: string }) => {
          setErrorMessage(e?.message || 'Twilio Device error');
          setStatus('error');
        });
        device.on('incoming', (call: Call) => {
          activeCallRef.current = call;
          setRemoteIdentifier(call.parameters.From || 'Unknown caller');
          setCallState('ringing-incoming');
          attachCallListeners(call);
        });
        device.on('tokenWillExpire', async () => {
          try {
            const refresh = await api.get<ApiResponse<{ token: string }>>('/voice/token');
            device.updateToken(refresh.data.token);
          } catch {
            /* ignore — device will surface error event */
          }
        });

        await device.register();
        deviceRef.current = device;
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Failed to initialise softphone';
        setErrorMessage(msg);
        setStatus('error');
      }
    }

    init();

    return () => {
      cancelled = true;
      const dev = deviceRef.current;
      if (dev) {
        try {
          dev.destroy();
        } catch {
          /* noop */
        }
      }
      deviceRef.current = null;
    };
  }, [user, attachCallListeners]);

  // ── Public API ─────────────────────────────────────────────────────────────
  const startCall = useCallback<TwilioContextValue['startCall']>(
    async (to, opts) => {
      const device = deviceRef.current;
      if (!device || status !== 'ready') {
        throw new Error('Softphone not ready');
      }
      if (callState !== 'idle') {
        throw new Error('Another call is already active');
      }
      setErrorMessage(null);
      setRemoteIdentifier(to);
      setCallState('connecting');

      const params: Record<string, string> = { To: to };
      if (opts?.candidateId) params.candidateId = opts.candidateId;
      if (user?.id) params.userId = user.id;

      try {
        const call = await device.connect({ params });
        activeCallRef.current = call;
        attachCallListeners(call);
      } catch (err) {
        setCallState('idle');
        setRemoteIdentifier(null);
        const msg = err instanceof Error ? err.message : 'Failed to start call';
        setErrorMessage(msg);
        throw err;
      }
    },
    [status, callState, user, attachCallListeners]
  );

  const acceptIncoming = useCallback(() => {
    const call = activeCallRef.current;
    if (call && callState === 'ringing-incoming') {
      call.accept();
    }
  }, [callState]);

  const rejectIncoming = useCallback(() => {
    const call = activeCallRef.current;
    if (call && callState === 'ringing-incoming') {
      call.reject();
    }
  }, [callState]);

  const hangup = useCallback(() => {
    const call = activeCallRef.current;
    if (call) {
      setCallState('ending');
      call.disconnect();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const call = activeCallRef.current;
    if (!call) return;
    const next = !isMuted;
    call.mute(next);
    setIsMuted(next);
  }, [isMuted]);

  const value: TwilioContextValue = {
    status,
    callState,
    errorMessage,
    remoteIdentifier,
    startCall,
    acceptIncoming,
    rejectIncoming,
    hangup,
    toggleMute,
    isMuted,
  };

  return <TwilioContext.Provider value={value}>{children}</TwilioContext.Provider>;
}
