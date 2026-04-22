import { CandidateStatus } from '@/types/candidate';
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/formatters';

interface Props {
  status: CandidateStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
