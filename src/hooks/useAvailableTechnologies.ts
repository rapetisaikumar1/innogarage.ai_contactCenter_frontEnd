'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ApiResponse, AvailableTechnology, TechnologyCategory } from '@/types';

export interface AvailableTechnologyInput {
  name: string;
  category: TechnologyCategory;
  description?: string;
}

export function useAvailableTechnologies() {
  const [data, setData] = useState<AvailableTechnology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAvailableTechnologies() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<ApiResponse<AvailableTechnology[]>>('/available-technologies');
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load available technologies');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchAvailableTechnologies();
  }, []);

  return { data, isLoading, error, refetch: fetchAvailableTechnologies };
}

export async function createAvailableTechnology(input: AvailableTechnologyInput): Promise<AvailableTechnology> {
  const res = await api.post<ApiResponse<AvailableTechnology>>('/available-technologies', input);
  return res.data;
}

export async function updateAvailableTechnology(
  technologyId: string,
  input: Partial<AvailableTechnologyInput>,
): Promise<AvailableTechnology> {
  const res = await api.patch<ApiResponse<AvailableTechnology>>(`/available-technologies/${technologyId}`, input);
  return res.data;
}

export async function deleteAvailableTechnology(technologyId: string): Promise<void> {
  await api.delete<ApiResponse<{ id: string }>>(`/available-technologies/${technologyId}`);
}