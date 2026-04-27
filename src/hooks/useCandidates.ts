'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Candidate, CandidateDetail, PaginatedCandidates } from '@/types/candidate';
import { ApiResponse } from '@/types';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useCandidates(params: ListParams = {}) {
  const [data, setData] = useState<PaginatedCandidates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.search) query.set('search', params.search);
      if (params.status) query.set('status', params.status);

      const res = await api.get<ApiResponse<PaginatedCandidates>>(
        `/candidates?${query.toString()}`
      );
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.search, params.status, params.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

export function useCandidateDetail(id: string) {
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<CandidateDetail>>(`/candidates/${id}`);
      setCandidate(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidate');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { candidate, isLoading, error, refetch: fetch };
}

export async function createCandidate(data: Partial<Candidate>): Promise<Candidate> {
  const res = await api.post<ApiResponse<Candidate>>('/candidates', data);
  return res.data;
}

export async function updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
  const res = await api.patch<ApiResponse<Candidate>>(`/candidates/${id}`, data);
  return res.data;
}

export async function updateCandidateStatus(id: string, status: string): Promise<Candidate> {
  const res = await api.patch<ApiResponse<Candidate>>(`/candidates/${id}/status`, { status });
  return res.data;
}

export async function assignCandidate(candidateId: string, userId: string): Promise<Candidate> {
  const res = await api.post<ApiResponse<Candidate>>(`/candidates/${candidateId}/assign`, { userId });
  return res.data;
}

// ── Transfer requests ─────────────────────────────────────────────────────────

export interface TransferRequest {
  id: string;
  candidateId: string;
  fromAgentId: string;
  toAgentId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  fromAgent: { id: string; name: string };
  toAgent: { id: string; name: string };
}

export async function getPendingTransferRequest(candidateId: string): Promise<TransferRequest | null> {
  const res = await api.get<ApiResponse<TransferRequest | null>>(`/candidates/${candidateId}/transfer-request/pending`);
  return res.data;
}

export async function createTransferRequest(candidateId: string, toAgentId: string): Promise<TransferRequest> {
  const res = await api.post<ApiResponse<TransferRequest>>(`/candidates/${candidateId}/transfer-request`, { toAgentId });
  return res.data;
}

export async function respondToTransferRequest(
  candidateId: string,
  requestId: string,
  action: 'accept' | 'reject',
): Promise<TransferRequest> {
  const res = await api.patch<ApiResponse<TransferRequest>>(
    `/candidates/${candidateId}/transfer-request/${requestId}/respond`,
    { action },
  );
  return res.data;
}
