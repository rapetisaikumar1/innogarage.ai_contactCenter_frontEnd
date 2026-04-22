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
        <h1 className="text-xl font-semibold text-gray-800">Follow-ups</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === opt.value && !overdue
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleOverdueToggle}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            overdue ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Overdue only
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading follow-ups...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !data || data.followUps.length === 0 ? (
          <p className="text-sm text-gray-400">No follow-ups found.</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {pagination?.total} follow-up{pagination?.total !== 1 ? 's' : ''}
            </p>
            <div>
              {data.followUps.map((fu) => (
                <div key={fu.id}>
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
