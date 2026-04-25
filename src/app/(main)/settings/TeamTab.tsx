'use client';

import { useState } from 'react';
import { useUsers, createUser, updateUser, UserProfile } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', MANAGER: 'Manager', AGENT: 'Agent' };
const ROLE_COLORS: Record<string, string> = {
  ADMIN:   'bg-slate-900 text-white',
  MANAGER: 'bg-slate-200 text-slate-800',
  AGENT:   'bg-slate-100 text-slate-600',
};

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AGENT' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createUser(form);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Add Team Member</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required minLength={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900" />
            <p className="text-xs text-slate-400 mt-1">Min 8 chars, one uppercase, one number</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900">
              <option value="AGENT">Agent</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {saving ? 'Creating…' : 'Create User'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-slate-200 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserRow({ user, onUpdated, isSelf }: { user: UserProfile; onUpdated: () => void; isSelf: boolean }) {
  const [saving, setSaving] = useState(false);
  const [editRole, setEditRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  async function toggleActive() {
    if (isSelf) return;
    setSaving(true);
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  async function saveRole() {
    setSaving(true);
    try {
      await updateUser(user.id, { role: selectedRole });
      setEditRole(false);
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{user.name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {editRole && !isSelf ? (
          <div className="flex items-center gap-2">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-900">
              <option value="AGENT">Agent</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button onClick={saveRole} disabled={saving} className="text-xs font-semibold text-slate-900 hover:underline disabled:opacity-50">
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={() => { setEditRole(false); setSelectedRole(user.role); }} className="text-xs text-slate-400 hover:underline">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => !isSelf && setEditRole(true)}
            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_COLORS[user.role] ?? 'bg-slate-100 text-slate-600'} ${!isSelf ? 'cursor-pointer hover:opacity-80' : ''}`}>
            {ROLE_LABELS[user.role] ?? user.role}
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {!isSelf && (
          <button onClick={toggleActive} disabled={saving}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-50 ${
              user.isActive
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}>
            {saving ? '…' : user.isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}
      </td>
    </tr>
  );
}

export default function TeamTab() {
  const { data: users, isLoading, error, refetch } = useUsers();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const selfId = user?.id ?? null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Team Members</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="p-6 text-sm text-red-600">{error}</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <UserRow key={u.id} user={u} onUpdated={refetch} isSelf={u.id === selfId} />
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <CreateUserModal onClose={() => setShowCreate(false)} onCreated={refetch} />
      )}
    </div>
  );
}
