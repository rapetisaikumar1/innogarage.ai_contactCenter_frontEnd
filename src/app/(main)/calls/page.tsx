'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useCalls, CallDirection, CallStatus, formatDuration, clearCallAlerts as clearCallAlertsApi } from '@/hooks/useCalls';
import { formatDateTime } from '@/utils/formatters';
import CallLogDetails from '@/components/calls/CallLogDetails';

const DIRECTION_OPTIONS: { label: string; value: CallDirection | '' }[] = [
  { label: 'All Directions', value: '' },
  { label: 'Outbound', value: 'OUTBOUND' },
  { label: 'Inbound', value: 'INBOUND' },
];

const STATUS_OPTIONS: { label: string; value: CallStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Missed', value: 'MISSED' },
  { label: 'In Call', value: 'IN_CALL' },
];

export default function CallsPage() {
  const [direction, setDirection] = useState<CallDirection | ''>('');
  const [status, setStatus] = useState<CallStatus | ''>('');
  const [page, setPage] = useState(1);
  const [clearingCallId, setClearingCallId] = useState<string | null>(null);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useCalls({ page, direction, status });

  function handleFilter() { setPage(1); }

  async function handleClearAlerts(callId: string) {
    setClearingCallId(callId);
    try {
      await clearCallAlertsApi(callId);
      await refetch();
    } finally {
      setClearingCallId(null);
    }
  }

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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition cursor-pointer"
          >
            {DIRECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as CallStatus | ''); handleFilter(); }}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition cursor-pointer"
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
                    <Fragment key={call.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/candidates/${call.candidateId}`} className="font-semibold text-slate-800 hover:text-slate-900 transition-colors text-sm">
                            {call.candidate.fullName}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">{call.phoneNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {call.direction === 'OUTBOUND' ? '↑ Outbound' : '↓ Inbound'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${
                            call.status === 'MISSED' ? 'text-red-600' :
                            call.status === 'COMPLETED' ? 'text-emerald-700' :
                            'text-blue-700'
                          }`}>
                            {call.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-slate-700">
                            {formatDuration(call.duration)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{call.loggedBy?.name ?? 'System'}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDateTime(call.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setExpandedCallId((current) => current === call.id ? null : call.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
                            >
                              {expandedCallId === call.id ? 'Hide Logs' : 'Show Logs'}
                            </button>
                            {call.status === 'MISSED' && call.openMissedAlertCount > 0 && (
                              <button
                                onClick={() => handleClearAlerts(call.id)}
                                disabled={clearingCallId === call.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-all"
                              >
                                {clearingCallId === call.id ? 'Clearing...' : 'Clear Alerts'}
                              </button>
                            )}
                            <Link
                              href={`/candidates/${call.candidateId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition-all"
                            >
                              View
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {expandedCallId === call.id && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={7} className="px-6 pb-4 pt-0">
                            <CallLogDetails call={call} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

