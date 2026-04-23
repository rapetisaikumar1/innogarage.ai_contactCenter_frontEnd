'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFollowUps, FollowUpStatus } from '@/hooks/useFollowUps';
import FollowUpCard from '@/components/follow-ups/FollowUpCard';

const STATUS_OPTIONS: { label: string; value: FollowUpStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rescheduled', value: 'RESCHEDULED' },
];

export default function FollowUpsPage() {
  const [status, setStatus] = useState<FollowUpStatus | ''>('');
  const [overdue, setOverdue] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useFollowUps({ page, status, overdue });

  function handleStatusChange(val: FollowUpStatus | '') {
    setStatus(val);
    setOverdue(false);
    setPage(1);
  }

  function handleOverdueToggle() {
    setOverdue((prev) => !prev);
    setStatus('');
    setPage(1);
  }

  const pagination = data?.pagination;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-6 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Follow-ups</h1>
          <p className="text-sm text-slate-500 mt-1">
            {data ? `${data.pagination.total} follow-up${data.pagination.total !== 1 ? 's' : ''} total` : 'Manage and track candidate follow-ups'}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-5">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  status === opt.value && !overdue
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <button
            onClick={handleOverdueToggle}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              overdue
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            Overdue only
          </button>
        </div>

        {/* Follow-up list card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-6 py-5 space-y-2 animate-pulse">
                  <div className="h-4 w-36 bg-slate-100 rounded-lg" />
                  <div className="h-3 w-64 bg-slate-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-500">{error}</div>
          ) : !data || data.followUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">No follow-ups found</p>
              <p className="text-xs text-slate-400 mt-1">Try switching to a different filter</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {data.followUps.map((fu) => (
                  <div key={fu.id} className="px-6 py-4 first:pt-5 last:pb-5 hover:bg-slate-50/60 transition-colors">
                    {fu.candidate && (
                      <Link
                        href={`/candidates/${fu.candidate.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-1 inline-block transition-colors"
                      >
                        {fu.candidate.fullName} →
                      </Link>
                    )}
                    <FollowUpCard followUp={fu} onUpdated={refetch} showCandidate={false} />
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-sm text-slate-500">
                    Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{pagination.totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-4 py-2 text-sm font-medium border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
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
