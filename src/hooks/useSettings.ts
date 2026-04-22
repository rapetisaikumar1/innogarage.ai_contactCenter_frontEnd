import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Own profile ──────────────────────────────────────────────────────────────
export function useProfile() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<UserProfile>>('/settings/profile');
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { data, isLoading, error, refetch: fetchProfile };
}

// ─── Update profile ───────────────────────────────────────────────────────────
export async function updateProfile(input: { name?: string; email?: string }): Promise<UserProfile> {
  const res = await api.patch<ApiResponse<UserProfile>>('/settings/profile', input);
  return res.data;
}

// ─── Change password ──────────────────────────────────────────────────────────
export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.post('/settings/password', input);
}

// ─── Team users ───────────────────────────────────────────────────────────────
export function useUsers() {
  const [data, setData] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<UserProfile[]>>('/settings/users');
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { data, isLoading, error, refetch: fetchUsers };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<UserProfile> {
  const res = await api.post<ApiResponse<UserProfile>>('/settings/users', input);
  return res.data;
}

export async function updateUser(
  userId: string,
  input: { name?: string; role?: string; isActive?: boolean },
): Promise<UserProfile> {
  const res = await api.patch<ApiResponse<UserProfile>>(`/settings/users/${userId}`, input);
  return res.data;
}
