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
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.pagination.total} follow-up${data.pagination.total !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Filter tabs — standalone, no card wrapper */}
      <div className="flex flex-wrap gap-2 items-center border-b border-gray-200 pb-3">
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === opt.value && !overdue
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-300" />
        <button
          onClick={handleOverdueToggle}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            overdue ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overdue only
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading follow-ups...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !data || data.followUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No follow-ups found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {data.followUps.map((fu) => (
                <div key={fu.id} className="py-3 first:pt-0 last:pb-0">
                  {fu.candidate && (
                    <Link
                      href={`/candidates/${fu.candidate.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {fu.candidate.fullName}
                    </Link>
                  )}
                  <FollowUpCard followUp={fu} onUpdated={refetch} showCandidate={false} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
