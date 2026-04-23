'use client';

import { FollowUp, updateFollowUp, FollowUpStatus } from '@/hooks/useFollowUps';
import { formatDateTime } from '@/utils/formatters';

const STATUS_STYLES: Record<FollowUpStatus, { cls: string; dot: string; label: string }> = {
  PENDING:     { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',   dot: 'bg-amber-400',  label: 'Pending' },
  COMPLETED:   { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500', label: 'Completed' },
  OVERDUE:     { cls: 'bg-red-50 text-red-700 ring-1 ring-red-200',         dot: 'bg-red-500',    label: 'Overdue' },
  RESCHEDULED: { cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',  dot: 'bg-slate-400',  label: 'Rescheduled' },
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

  const style = STATUS_STYLES[followUp.status];

  return (
    <div className="flex items-start justify-between gap-4 mt-1">
      <div className="min-w-0 flex-1 space-y-1">
        {showCandidate && followUp.candidate && (
          <p className="text-sm font-semibold text-slate-800 truncate">{followUp.candidate.fullName}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
            {style.label}
          </span>
          <span className="text-xs text-slate-500">
            Due <span className="font-medium text-slate-700">{formatDateTime(followUp.dueAt)}</span>
          </span>
        </div>
        {followUp.remarks && (
          <p className="text-sm text-slate-600 leading-snug">{followUp.remarks}</p>
        )}
        <p className="text-xs text-slate-400">
          Assigned by <span className="font-medium text-slate-500">{followUp.user.name}</span>
          {followUp.completedAt && ` · Completed ${formatDateTime(followUp.completedAt)}`}
        </p>
      </div>
      {(followUp.status === 'PENDING' || followUp.status === 'OVERDUE') && (
        <button
          onClick={handleComplete}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Done
        </button>
      )}
    </div>
  );
}

