'use client';

import { useState } from 'react';
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

const STATUS_STYLES: Record<CallStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  MISSED: 'bg-red-100 text-red-700',
  FAILED: 'bg-orange-100 text-orange-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
};

export default function CallsPage() {
  const [direction, setDirection] = useState<CallDirection | ''>('');
  const [status, setStatus] = useState<CallStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useCalls({ page, direction, status });

  function handleFilter() {
    setPage(1);
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Call Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.pagination.total} total calls` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={direction}
          onChange={(e) => { setDirection(e.target.value as CallDirection | ''); handleFilter(); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DIRECTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as CallStatus | ''); handleFilter(); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error ? (
          <p className="p-6 text-sm text-red-500">{error}</p>
        ) : isLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : !data || data.calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm">No calls found</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Direction</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Logged By</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/candidates/${call.candidateId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {call.candidate.fullName}
                      </Link>
                      <p className="text-xs text-gray-400">{call.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        call.direction === 'OUTBOUND' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {call.direction === 'OUTBOUND' ? '↗' : '↙'} {call.direction.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[call.status]}`}>
                        {call.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDuration(call.duration)}</td>
                    <td className="px-6 py-4 text-gray-500">{call.loggedBy.name}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDateTime(call.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
