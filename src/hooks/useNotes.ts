import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  candidateId: string;
  user: { id: string; name: string };
}

export function useNotes(candidateId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Note[]>>(`/candidates/${candidateId}/notes`);
      setNotes(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchNotes();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchNotes]);

  return { notes, isLoading, error, refetch: fetchNotes };
}

export async function createNote(candidateId: string, content: string): Promise<Note> {
  const res = await api.post<ApiResponse<Note>>(`/candidates/${candidateId}/notes`, { content });
  return res.data;
}

export async function deleteNote(candidateId: string, noteId: string): Promise<void> {
  await api.delete<ApiResponse<null>>(`/candidates/${candidateId}/notes/${noteId}`);
}
