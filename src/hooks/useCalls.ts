import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export type CallDirection = 'INBOUND' | 'OUTBOUND';
export type CallStatus = 'COMPLETED' | 'MISSED' | 'FAILED' | 'IN_PROGRESS';

export interface Call {
  id: string;
  candidateId: string;
  loggedById: string;
  direction: CallDirection;
  phoneNumber: string;
  duration: number | null;
  status: CallStatus;
  providerCallId: string | null;
  notes: string | null;
  createdAt: string;
  candidate: { id: string; fullName: string; phoneNumber: string };
  loggedBy: { id: string; name: string };
}

export interface CallsPage {
  calls: Call[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface LogCallInput {
  candidateId: string;
  direction: CallDirection;
  phoneNumber: string;
  duration?: number;
  status: CallStatus;
  notes?: string;
}

// ─── All calls (dashboard) ────────────────────────────────────────────────────
export function useCalls(params: {
  page: number;
  direction?: CallDirection | '';
  status?: CallStatus | '';
  candidateId?: string;
}) {
  const [data, setData] = useState<CallsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const qs = new URLSearchParams();
    qs.set('page', String(params.page));
    if (params.direction) qs.set('direction', params.direction);
    if (params.status) qs.set('status', params.status);
    if (params.candidateId) qs.set('candidateId', params.candidateId);
    try {
      const res = await api.get<ApiResponse<CallsPage>>(`/calls?${qs.toString()}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.direction, params.status, params.candidateId]);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);
  return { data, isLoading, error, refetch: fetchCalls };
}

// ─── Calls for a single candidate ────────────────────────────────────────────
export function useCallsByCandidate(candidateId: string) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<CallsPage>>(`/candidates/${candidateId}/calls`);
      setCalls(res.data.calls);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);
  return { calls, isLoading, error, refetch: fetchCalls };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export async function logCall(input: LogCallInput): Promise<Call> {
  const res = await api.post<ApiResponse<Call>>('/calls', input);
  return res.data;
}

export async function updateCall(
  callId: string,
  input: { duration?: number; status?: CallStatus; notes?: string }
): Promise<Call> {
  const res = await api.patch<ApiResponse<Call>>(`/calls/${callId}`, input);
  return res.data;
}

export async function deleteCall(callId: string): Promise<void> {
  await api.delete<ApiResponse<{ deleted: boolean }>>(`/calls/${callId}`);
}

// ─── Initiate outbound call via Twilio Voice ──────────────────────────────────
export async function initiateCall(candidateId: string): Promise<{ callSid: string }> {
  const res = await api.post<ApiResponse<{ callSid: string }>>('/calls/initiate', { candidateId });
  return res.data;
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
