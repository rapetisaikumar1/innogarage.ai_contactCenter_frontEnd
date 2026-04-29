'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getSession } from '@/lib/session';
import { ApiResponse, BgcFileInput, BgcRecord, BgcRecordInput } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface MonthYearQuery {
  month?: string;
  year?: string;
}

function buildMonthYearQuery(filter?: MonthYearQuery): string {
  const query = new URLSearchParams();
  if (filter?.year) query.set('year', filter.year);
  if (filter?.month && filter.year) query.set('month', filter.month);
  return query.toString();
}

export function useBgcRecords(enabled = true, filter?: MonthYearQuery) {
  const [data, setData] = useState<BgcRecord[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const query = buildMonthYearQuery(filter);
      const res = await api.get<ApiResponse<BgcRecord[]>>(`/bgc${query ? `?${query}` : ''}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load BGC records');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, filter?.month, filter?.year]);

  useEffect(() => {
    if (enabled) {
      void Promise.resolve().then(fetchRecords);
    }
  }, [enabled, fetchRecords]);

  return { data, isLoading, error, refetch: fetchRecords };
}

export function useBgcRecord(recordId: string | null, enabled = true) {
  const shouldLoad = enabled && Boolean(recordId);
  const [data, setData] = useState<BgcRecord | null>(null);
  const [isLoading, setIsLoading] = useState(shouldLoad);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    if (!recordId || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<ApiResponse<BgcRecord>>(`/bgc/${recordId}`);
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load BGC record');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, recordId]);

  useEffect(() => {
    if (shouldLoad) {
      void Promise.resolve().then(fetchRecord);
    }
  }, [fetchRecord, shouldLoad]);

  return { data, isLoading, error, refetch: fetchRecord };
}

function buildBgcFormData(input: BgcRecordInput, files: BgcFileInput): FormData {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    formData.append(key, value ?? '');
  });

  Object.entries(files).forEach(([field, fieldFiles]) => {
    fieldFiles.forEach((file) => formData.append(field, file));
  });

  return formData;
}

export async function createBgcRecord(input: BgcRecordInput, files: BgcFileInput): Promise<BgcRecord> {
  const token = getSession()?.token;
  const formData = buildBgcFormData(input, files);

  const res = await fetch(`${API_URL}/bgc`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Failed to save BGC record');
  }

  return json.data;
}

export async function updateBgcRecord(recordId: string, input: BgcRecordInput, files: BgcFileInput): Promise<BgcRecord> {
  const token = getSession()?.token;
  const formData = buildBgcFormData(input, files);

  const res = await fetch(`${API_URL}/bgc/${recordId}`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Failed to update BGC record');
  }

  return json.data;
}