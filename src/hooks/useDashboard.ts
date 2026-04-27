import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface CandidateStatusCount {
  status: string;
  count: number;
}

export interface DashboardStats {
  totalCandidates: number;
  candidatesByStatus: CandidateStatusCount[];
  todayFollowUps: number;
  overdueFollowUps: number;
  totalCallsToday: number;
  totalMessagesToday: number;
  recentCandidates: {
    id: string;
    fullName: string;
    status: string;
    phoneNumber: string;
    createdAt: string;
  }[];
  recentCalls: {
    id: string;
    direction: string;
    status: string;
    duration: number | null;
    createdAt: string;
    candidate: { id: string; fullName: string };
    loggedBy: { id: string; name: string };
  }[];
  recentMessages: {
    candidateId: string;
    candidateName: string;
    lastMessage: string;
    lastMessageAt: string;
    lastDirection: string;
  }[];
}

export function useDashboard(dateRange?: { from: string; to: string }) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (dateRange?.from) query.set('from', dateRange.from);
      if (dateRange?.to) query.set('to', dateRange.to);
      const qs = query.toString();
      const res = await api.get<ApiResponse<DashboardStats>>(`/dashboard${qs ? `?${qs}` : ''}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange?.from, dateRange?.to]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}
