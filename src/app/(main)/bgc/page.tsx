'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useBgcRecords } from '@/hooks/useBgcRecords';

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value));
}

export default function BgcPage() {
  const { user } = useAuth();
  const canAccessBgc = user?.role === 'ADMIN' || Boolean(user?.canAccessBgc);
  const { data, isLoading, error } = useBgcRecords(canAccessBgc);

  if (!canAccessBgc) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">BGC access is restricted</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have permission to view this workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">BGC</h1>
          <p className="mt-1 text-sm text-slate-500">Manage background-check information and supporting document sets.</p>
        </div>
        <Link href="/bgc/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14m7-7H5" />
          </svg>
          Add new record
        </Link>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Saved Records</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-950">No BGC records yet</h3>
            <p className="mt-2 text-sm text-slate-500">Create the first record to start tracking candidate background-check details.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">DOB</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">US / Canada Job Title</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">From</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">To</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Documents</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-950">{record.fullName}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(record.dob)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{record.usJobTitle || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(record.usFromDate)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(record.usToDate)}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {record.resumeFiles.length + record.usCanadaBgcFiles.length + record.indiaBgcFiles.length} files
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/bgc/${record.id}`} className="inline-flex items-center gap-1 rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-slate-50">
                          View
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <Link href={`/bgc/new?edit=${record.id}`} aria-label={`Edit ${record.fullName}`} className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M16.862 3.487a2.1 2.1 0 113.03 2.91L8.82 17.926l-4.11.6.728-4.082L16.862 3.487z"
                            />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}