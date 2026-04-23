'use client';

import { useState } from 'react';
import { useProfile, updateProfile } from '@/hooks/useSettings';

export default function ProfileTab() {
  const { data, isLoading, refetch } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Populate fields once profile loads (only first time)
  if (data && name === '' && email === '') {
    setName(data.name);
    setEmail(data.email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updates: { name?: string; email?: string } = {};
      if (name !== data?.name) updates.name = name;
      if (email !== data?.email) updates.email = email;
      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }
      await updateProfile(updates);
      setSuccess(true);
      refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', MANAGER: 'Manager', AGENT: 'Agent' };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Role badge (read-only) */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg">
              {data?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{data?.name}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[data?.role ?? ''] ?? data?.role}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            {error && <p className="text-sm text-gray-600">{error}</p>}
            {success && <p className="text-sm text-gray-600">Profile updated successfully.</p>}

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
