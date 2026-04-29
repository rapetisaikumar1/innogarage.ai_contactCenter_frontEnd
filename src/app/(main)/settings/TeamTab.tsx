'use client';

import { useState } from 'react';
import { createUser, deleteUser, updateUser, useDepartments, useUsers, UserProfile } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';

type TeamRole = 'AGENT' | 'MANAGER' | 'ADMIN';

const ROLE_LABELS: Record<TeamRole, string> = { ADMIN: 'Admin', MANAGER: 'Manager', AGENT: 'Mentor' };
const ROLE_COLORS: Record<TeamRole, string> = {
  ADMIN: 'bg-slate-900 text-white',
  MANAGER: 'bg-slate-200 text-slate-800',
  AGENT: 'bg-slate-100 text-slate-700',
};

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const orderedDepartments = [...departments].sort((left, right) => {
    const createdAtDifference = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    return createdAtDifference !== 0
      ? createdAtDifference
      : left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
  });
  const [form, setForm] = useState({
    role: 'AGENT' as TeamRole,
    email: '',
    password: '',
    departmentId: '',
    canAccessBgc: false,
    canAccessPaymentHistory: false,
    canAccessMentors: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMentor = form.role === 'AGENT';
  const selectedDepartmentId = isMentor ? (form.departmentId || orderedDepartments[0]?.id || '') : '';

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createUser({
        email: form.email,
        password: form.password,
        role: form.role,
        departmentId: isMentor ? selectedDepartmentId : null,
        canAccessBgc: isMentor ? form.canAccessBgc : false,
        canAccessPaymentHistory: isMentor ? form.canAccessPaymentHistory : false,
        canAccessMentors: isMentor ? form.canAccessMentors : false,
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Add Team Member</h3>
          <button onClick={onClose} aria-label="Close" className="text-xl leading-none text-slate-400 hover:text-slate-700">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['AGENT', 'MANAGER', 'ADMIN'] as TeamRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => update('role', role)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    form.role === role
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>

          {isMentor && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
              <select
                value={selectedDepartmentId}
                onChange={(event) => update('departmentId', event.target.value)}
                required
                disabled={departmentsLoading || orderedDepartments.length === 0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-100"
              >
                {orderedDepartments.length === 0 ? (
                  <option value="">Create a department first</option>
                ) : (
                  orderedDepartments.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))
                )}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <p className="mt-1 text-xs text-slate-400">Min 8 chars, one uppercase, one number</p>
          </div>

          {isMentor && (
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-3 text-sm font-semibold text-slate-800">Mentor portal access</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  BGC
                  <input
                    type="checkbox"
                    checked={form.canAccessBgc}
                    onChange={(event) => update('canAccessBgc', event.target.checked)}
                    className="h-4 w-4 accent-slate-900"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  Payment History
                  <input
                    type="checkbox"
                    checked={form.canAccessPaymentHistory}
                    onChange={(event) => update('canAccessPaymentHistory', event.target.checked)}
                    className="h-4 w-4 accent-slate-900"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  Mentors
                  <input
                    type="checkbox"
                    checked={form.canAccessMentors}
                    onChange={(event) => update('canAccessMentors', event.target.checked)}
                    className="h-4 w-4 accent-slate-900"
                  />
                </label>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || (isMentor && orderedDepartments.length === 0)}
              className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Member'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserRow({ user, onUpdated, isSelf }: { user: UserProfile; onUpdated: () => void; isSelf: boolean }) {
  const [updatingActive, setUpdatingActive] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const role = user.role as TeamRole;
  const isMentor = user.role === 'AGENT';
  const loginAccessLabel = user.isActive ? 'Login access enabled' : 'Login access disabled';

  async function handleToggleActive() {
    if (isSelf || updatingActive) return;

    setUpdatingActive(true);
    setError(null);
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setUpdatingActive(false);
    }
  }

  async function handleDelete() {
    if (isSelf || deleting) return;
    if (!window.confirm(`Delete ${user.name}?`)) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteUser(user.id);
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <tr className="align-top transition-colors hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{user.name} {isSelf && <span className="text-xs text-slate-400">(you)</span>}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                {loginAccessLabel}
              </span>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-600'}`}>
          {ROLE_LABELS[role] ?? user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {isMentor ? user.department?.name ?? 'Not assigned' : 'Not applicable'}
      </td>
      <td className="px-4 py-3">
        {isMentor ? (
          <div className="flex flex-wrap gap-1.5">
            {user.canAccessBgc && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">BGC</span>}
            {user.canAccessPaymentHistory && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Payment History</span>}
            {user.canAccessMentors && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Mentors</span>}
            {!user.canAccessBgc && !user.canAccessPaymentHistory && !user.canAccessMentors && <span className="text-xs text-slate-400">Standard</span>}
          </div>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {!isSelf && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleToggleActive}
              disabled={updatingActive}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${user.isActive ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
            >
              {updatingActive ? 'Updating...' : user.isActive ? 'Disable Login' : 'Enable Login'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
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
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Team Members</h3>
          <p className="mt-1 text-xs text-slate-500">Manage portal sign-in access and role-based permissions for each team member.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <p className="p-6 text-sm text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Portal Access</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((teamUser) => (
                <UserRow key={teamUser.id} user={teamUser} onUpdated={refetch} isSelf={teamUser.id === selfId} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </div>
  );
}
