'use client';

import { useState } from 'react';
import { createDepartment, useDepartments } from '@/hooks/useSettings';

export default function DepartmentsTab() {
  const { data: departments, isLoading, error, refetch } = useDepartments();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const sortedDepartments = [...departments].sort((left, right) => {
    const createdAtDifference = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    return createdAtDifference !== 0
      ? createdAtDifference
      : left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      await createDepartment({ name: name.trim(), description: description.trim() || null });
      setName('');
      setDescription('');
      await refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create department');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Create Departments</h3>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Department name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Example: Sales, Recruiting, Support"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Optional"
            />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Department'}
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="h-10 w-1.5 rounded-full bg-slate-900" aria-hidden="true" />
              <div>
                <p className="text-base font-bold text-slate-950">Departments</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Ordered by creation time
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <p className="p-4 text-sm text-red-600">{error}</p>
          ) : departments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-slate-900">No departments yet</p>
              <p className="mt-1 text-sm text-slate-500">Create the first department before adding mentors.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedDepartments.map((department) => (
                <div key={department.id} className="px-5 py-4">
                  <p className="text-base font-semibold text-slate-900">{department.name}</p>
                  {department.description && <p className="mt-1 text-sm text-slate-500">{department.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
