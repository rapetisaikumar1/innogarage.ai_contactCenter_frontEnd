import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'RESCHEDULED';

export interface FollowUp {
  id: string;
  dueAt: string;
  status: FollowUpStatus;
  remarks?: string | null;
  completedAt?: string | null;
  createdAt: string;
  candidateId: string;
  candidate?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  user: { id: string; name: string };
}

export interface PaginatedFollowUps {
  followUps: FollowUp[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// Hook: follow-ups for a candidate (nested)
export function useFollowUpsByCandidate(candidateId: string) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<FollowUp[]>>(`/candidates/${candidateId}/follow-ups`);
      setFollowUps(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchFollowUps();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchFollowUps]);

  return { followUps, isLoading, error, refetch: fetchFollowUps };
}

// Hook: dashboard follow-ups list (with pagination + filters)
export function useFollowUps(params: {
  page?: number;
  status?: FollowUpStatus | '';
}) {
  const [data, setData] = useState<PaginatedFollowUps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.status) query.set('status', params.status);
      const res = await api.get<ApiResponse<PaginatedFollowUps>>(`/follow-ups?${query.toString()}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.status]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchFollowUps();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchFollowUps]);

  return { data, isLoading, error, refetch: fetchFollowUps };
}

export async function createFollowUp(
  candidateId: string,
  input: { dueAt: string; remarks?: string }
): Promise<FollowUp> {
  const res = await api.post<ApiResponse<FollowUp>>(`/candidates/${candidateId}/follow-ups`, input);
  return res.data;
}

export async function updateFollowUp(
  followUpId: string,
  input: { status: FollowUpStatus; remarks?: string; dueAt?: string }
): Promise<FollowUp> {
  const res = await api.patch<ApiResponse<FollowUp>>(`/follow-ups/${followUpId}`, input);
  return res.data;
}
