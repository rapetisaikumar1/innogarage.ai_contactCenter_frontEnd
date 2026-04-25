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
