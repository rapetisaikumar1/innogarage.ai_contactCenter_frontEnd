'use client';

import { FollowUp, updateFollowUp, FollowUpStatus } from '@/hooks/useFollowUps';
import { formatDateTime } from '@/utils/formatters';

const STATUS_STYLES: Record<FollowUpStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  RESCHEDULED: 'bg-blue-100 text-blue-700',
};

interface Props {
  followUp: FollowUp;
  onUpdated: () => void;
  showCandidate?: boolean;
}

export default function FollowUpCard({ followUp, onUpdated, showCandidate = false }: Props) {
  async function handleComplete() {
    try {
      await updateFollowUp(followUp.id, { status: 'COMPLETED' });
      onUpdated();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update follow-up');
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        {showCandidate && followUp.candidate && (
          <p className="text-sm font-medium text-gray-800 truncate">{followUp.candidate.fullName}</p>
        )}
        <p className="text-sm text-gray-700">
          Due: <span className="font-medium">{formatDateTime(followUp.dueAt)}</span>
        </p>
        {followUp.remarks && (
          <p className="text-sm text-gray-500 mt-0.5">{followUp.remarks}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          Assigned by {followUp.user.name}
          {followUp.completedAt && ` · Completed ${formatDateTime(followUp.completedAt)}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[followUp.status]}`}>
          {followUp.status}
        </span>
        {followUp.status === 'PENDING' || followUp.status === 'OVERDUE' ? (
          <button
            onClick={handleComplete}
            className="text-xs px-2 py-1 border border-green-300 text-green-700 rounded hover:bg-green-50"
          >
            Done
          </button>
        ) : null}
      </div>
    </div>
  );
}
