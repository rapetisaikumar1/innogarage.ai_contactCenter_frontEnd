'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

type DeviceStatus = 'uninitialized' | 'initializing' | 'ready' | 'error';
type CallState = 'idle' | 'ringing-incoming' | 'connecting' | 'in-call' | 'ending';

interface IncomingCallInfo {
  sessionId: string | null;
  candidateId: string | null;
  candidateName: string | null;
  phoneNumber: string | null;
  isUnknownCaller: boolean;
  bridgedCallSid: string | null;
}

interface VoiceSessionEvent {
  id: string;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  finalStatus?: 'COMPLETED' | 'MISSED';
}

interface TwilioContextValue {
  status: DeviceStatus;
  callState: CallState;
  errorMessage: string | null;
  remoteIdentifier: string | null;
  incomingCall: IncomingCallInfo | null;
  isClaimingIncoming: boolean;
  startCall: (to: string, opts?: { candidateId?: string }) => Promise<void>;
  acceptIncoming: () => Promise<void>;
  rejectIncoming: () => Promise<void>;
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
  const callStateRef = useRef<CallState>('idle');
  const incomingCallRef = useRef<IncomingCallInfo | null>(null);

  const [status, setStatus] = useState<DeviceStatus>('uninitialized');
  const [callState, setCallState] = useState<CallState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remoteIdentifier, setRemoteIdentifier] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [isClaimingIncoming, setIsClaimingIncoming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  const clearActiveCall = useCallback(() => {
    activeCallRef.current = null;
    setCallState('idle');
    setRemoteIdentifier(null);
    setIncomingCall(null);
    setIsClaimingIncoming(false);
    setIsMuted(false);
  }, []);

  const dismissIncomingLocally = useCallback((message?: string) => {
    const activeCall = activeCallRef.current;
    if (message) {
      setErrorMessage(message);
    }

    if (activeCall) {
      try {
        activeCall.ignore();
      } catch {
        try {
          activeCall.reject();
        } catch {
          // noop
        }
      }
    }

    clearActiveCall();
  }, [clearActiveCall]);

  const extractIncomingCall = useCallback((call: Call): IncomingCallInfo => {
    const candidateName = call.customParameters.get('candidateName') || null;
    const phoneNumber = call.customParameters.get('phoneNumber') || call.parameters.From || null;
    return {
      sessionId: call.customParameters.get('sessionId') || null,
      candidateId: call.customParameters.get('candidateId') || null,
      candidateName,
      phoneNumber,
      isUnknownCaller: call.customParameters.get('isUnknownCaller') === 'true',
      bridgedCallSid: call.parameters.CallSid || null,
    };
  }, []);

  const attachCallListeners = useCallback((call: Call) => {
    call.on('accept', () => {
      setCallState('in-call');
      setIsClaimingIncoming(false);
      setIsMuted(false);
    });
    call.on('disconnect', () => {
      clearActiveCall();
    });
    call.on('cancel', () => {
      clearActiveCall();
    });
    call.on('reject', () => {
      clearActiveCall();
    });
    call.on('error', (e: { message?: string }) => {
      setErrorMessage(e?.message || 'Call error');
      clearActiveCall();
    });
  }, [clearActiveCall]);

  useSocket({
    'voice:incoming:claimed': (payload) => {
      const event = payload as VoiceSessionEvent;
      const currentIncoming = incomingCallRef.current;
      if (!currentIncoming?.sessionId || currentIncoming.sessionId !== event.id) {
        return;
      }
      if (event.assignedAgentId && event.assignedAgentId !== user?.id) {
        const agentName = event.assignedAgentName || 'Another agent';
        dismissIncomingLocally(`${agentName} accepted this call`);
      }
    },
    'voice:incoming:ended': (payload) => {
      const event = payload as VoiceSessionEvent;
      const currentIncoming = incomingCallRef.current;
      if (!currentIncoming?.sessionId || currentIncoming.sessionId !== event.id) {
        return;
      }
      if (callStateRef.current === 'ringing-incoming' || callStateRef.current === 'connecting') {
        dismissIncomingLocally(event.finalStatus === 'MISSED' ? 'The incoming call ended before it was connected' : undefined);
      }
    },
  });

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
          codecPreferences: ['opus' as unknown as Call.Codec, 'pcmu' as unknown as Call.Codec],
          logLevel: 'warn',
        });

        device.on('registered', () => setStatus('ready'));
        device.on('error', (e: { message?: string }) => {
          setErrorMessage(e?.message || 'Twilio Device error');
          setStatus('error');
        });
        device.on('incoming', (call: Call) => {
          if (callStateRef.current !== 'idle' || activeCallRef.current) {
            try {
              call.reject();
            } catch {
              // noop
            }
            return;
          }

          const nextIncomingCall = extractIncomingCall(call);
          activeCallRef.current = call;
          setIncomingCall(nextIncomingCall);
          setRemoteIdentifier(nextIncomingCall.candidateName || nextIncomingCall.phoneNumber || 'Unknown caller');
          setCallState('ringing-incoming');
          setErrorMessage(null);
          attachCallListeners(call);
        });
        device.on('tokenWillExpire', async () => {
          try {
            const refresh = await api.get<ApiResponse<{ token: string }>>('/voice/token');
            device.updateToken(refresh.data.token);
          } catch {
            // ignore — device will surface error event
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
          // noop
        }
      }
      deviceRef.current = null;
    };
  }, [user, attachCallListeners, extractIncomingCall]);

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
        clearActiveCall();
        const msg = err instanceof Error ? err.message : 'Failed to start call';
        setErrorMessage(msg);
        throw err;
      }
    },
    [status, callState, user, attachCallListeners, clearActiveCall],
  );

  const acceptIncoming = useCallback<TwilioContextValue['acceptIncoming']>(async () => {
    const call = activeCallRef.current;
    const activeIncomingCall = incomingCallRef.current;
    if (!call || callStateRef.current !== 'ringing-incoming' || isClaimingIncoming) {
      return;
    }

    if (!activeIncomingCall?.sessionId) {
      setErrorMessage(null);
      setCallState('connecting');
      call.accept();
      return;
    }

    setErrorMessage(null);
    setIsClaimingIncoming(true);

    try {
      await api.post<ApiResponse<{ id: string }>>(`/calls/voice/${activeIncomingCall.sessionId}/claim`, {
        bridgedCallSid: activeIncomingCall.bridgedCallSid,
      });
      setCallState('connecting');
      call.accept();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept incoming call';
      dismissIncomingLocally(message);
    } finally {
      setIsClaimingIncoming(false);
    }
  }, [dismissIncomingLocally, isClaimingIncoming]);

  const rejectIncoming = useCallback<TwilioContextValue['rejectIncoming']>(async () => {
    const call = activeCallRef.current;
    const activeIncomingCall = incomingCallRef.current;
    if (!call || callStateRef.current !== 'ringing-incoming') {
      return;
    }

    const rejectLocally = () => {
      try {
        call.reject();
      } catch {
        clearActiveCall();
      }
    };

    if (!activeIncomingCall?.sessionId) {
      rejectLocally();
      return;
    }

    try {
      await api.post<ApiResponse<{ ok: boolean }>>(`/calls/voice/${activeIncomingCall.sessionId}/reject`, {});
    } catch {
      // local rejection still needs to happen
    } finally {
      rejectLocally();
    }
  }, [clearActiveCall]);

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
    incomingCall,
    isClaimingIncoming,
    startCall,
    acceptIncoming,
    rejectIncoming,
    hangup,
    toggleMute,
    isMuted,
  };

  return <TwilioContext.Provider value={value}>{children}</TwilioContext.Provider>;
}
