'use client';

import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { useCalls, CallDirection, CallStatus, formatDuration } from '@/hooks/useCalls';
import { formatDateTime } from '@/utils/formatters';

const DIRECTION_OPTIONS: { label: string; value: CallDirection | '' }[] = [
  { label: 'All Directions', value: '' },
  { label: 'Outbound', value: 'OUTBOUND' },
  { label: 'Inbound', value: 'INBOUND' },
];

const STATUS_OPTIONS: { label: string; value: CallStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Missed', value: 'MISSED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
];

const STATUS_STYLES: Record<CallStatus, { cls: string; icon: React.ReactNode }> = {
  COMPLETED: {
    cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    icon: <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
  },
  MISSED: {
    cls: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    icon: <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
  },
  FAILED: {
    cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    icon: <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
  },
  IN_PROGRESS: {
    cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    icon: <svg className="w-3 h-3 animate-pulse" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
  },
};

export default function CallsPage() {
  const [direction, setDirection] = useState<CallDirection | ''>('');
  const [status, setStatus] = useState<CallStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useCalls({ page, direction, status });

  function handleFilter() { setPage(1); }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Call Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {data ? `${data.pagination.total} total calls recorded` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-sm shadow-indigo-300"
        >
          <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="p-6 space-y-4">

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={direction}
            onChange={(e) => { setDirection(e.target.value as CallDirection | ''); handleFilter(); }}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {DIRECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as CallStatus | ''); handleFilter(); }}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {error ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-500">{error}</div>
          ) : isLoading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse ml-4" />
                  <div className="h-6 w-14 bg-slate-100 rounded-lg animate-pulse ml-auto" />
                </div>
              ))}
            </div>
          ) : !data || data.calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">No calls found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Direction</th>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Logged By</th>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                    <th className="px-6 py-3.5 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.calls.map((call) => (
                    <tr key={call.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/candidates/${call.candidateId}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors text-sm">
                          {call.candidate.fullName}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">{call.phoneNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          call.direction === 'OUTBOUND'
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                        }`}>
                          {call.direction === 'OUTBOUND'
                            ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                            : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                          }
                          {call.direction.charAt(0) + call.direction.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[call.status].cls}`}>
                          {STATUS_STYLES[call.status].icon}
                          {call.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 ring-1 ring-teal-200 px-2.5 py-1 rounded-lg">
                          {formatDuration(call.duration)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{call.loggedBy.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDateTime(call.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/candidates/${call.candidateId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          View
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-sm text-slate-500">
                    Page <span className="font-semibold text-slate-700">{data.pagination.page}</span> of <span className="font-semibold text-slate-700">{data.pagination.totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                      className="px-4 py-2 text-sm font-medium border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

