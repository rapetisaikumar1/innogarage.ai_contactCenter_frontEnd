import { CandidateStatus } from '@/types/candidate';
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/formatters';

const STATUS_DOTS: Record<string, string> = {
  NEW: 'bg-slate-500',
  CONTACTED: 'bg-sky-500',
  INTERESTED: 'bg-amber-500',
  DOCUMENTS_PENDING: 'bg-orange-500',
  INTERVIEW_SCHEDULED: 'bg-violet-500',
  FOLLOW_UP_REQUIRED: 'bg-rose-500',
  CLOSED_WON: 'bg-emerald-500',
  CLOSED_LOST: 'bg-red-500',
};

interface Props {
  status: CandidateStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOTS[status] ?? 'bg-gray-500'}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
