import { CandidateStatus } from '@/types/candidate';
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/formatters';

const STATUS_DOTS: Record<string, string> = {
  INITIAL_EVALUATION_DONE: 'bg-slate-500',
  AWAITING_RESUME:         'bg-amber-500',
  RESUME_SHARED:           'bg-sky-500',
  MARKETING_STARTED:       'bg-violet-500',
  CANDIDATE_GOT_OFFER:     'bg-emerald-500',
  BGC_ONGOING:             'bg-orange-500',
  STARTED_WORKING:         'bg-green-600',
};

const STATUS_TEXT: Record<string, string> = {
  INITIAL_EVALUATION_DONE: 'text-slate-700',
  AWAITING_RESUME:         'text-amber-700',
  RESUME_SHARED:           'text-sky-700',
  MARKETING_STARTED:       'text-violet-700',
  CANDIDATE_GOT_OFFER:     'text-emerald-700',
  BGC_ONGOING:             'text-orange-700',
  STARTED_WORKING:         'text-green-700',
};

interface Props {
  status: CandidateStatus;
  variant?: 'badge' | 'text';
}

export default function StatusBadge({ status, variant = 'badge' }: Props) {
  if (variant === 'text') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${STATUS_TEXT[status] ?? 'text-gray-600'}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOTS[status] ?? 'bg-gray-500'}`} />
        {STATUS_LABELS[status] ?? status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOTS[status] ?? 'bg-gray-500'}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
