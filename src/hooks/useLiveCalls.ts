'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { useSocket } from '@/hooks/useSocket';

export interface LiveVoiceSession {
  id: string;
  callId: string | null;
  candidateId: string;
  candidateName: string;
  phoneNumber: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'RINGING' | 'CLAIMED' | 'IN_CALL' | 'ENDED';
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  isUnknownCaller: boolean;
  createdAt: string;
  claimedAt: string | null;
  answeredAt: string | null;
  endedAt: string | null;
}

interface LiveVoiceSessionEndedEvent extends LiveVoiceSession {
  finalStatus?: 'COMPLETED' | 'MISSED';
}

function sortSessions(sessions: LiveVoiceSession[]): LiveVoiceSession[] {
  return [...sessions].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function useLiveCalls() {
  const [sessions, setSessions] = useState<LiveVoiceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const upsertSession = useCallback((session: LiveVoiceSession) => {
    setSessions((current) => sortSessions([session, ...current.filter((item) => item.id !== session.id)]));
  }, []);

  const removeSession = useCallback((sessionId: string) => {
    setSessions((current) => current.filter((item) => item.id !== sessionId));
  }, []);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<LiveVoiceSession[]>>('/calls/voice/live');
      setSessions(sortSessions(res.data));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load live calls');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useSocket({
    'voice:incoming:new': (payload) => {
      upsertSession(payload as LiveVoiceSession);
    },
    'voice:incoming:claimed': (payload) => {
      upsertSession(payload as LiveVoiceSession);
    },
    'voice:incoming:ended': (payload) => {
      removeSession((payload as LiveVoiceSessionEndedEvent).id);
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchSessions();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchSessions]);

  return { sessions, isLoading, error, refetch: fetchSessions };
}
