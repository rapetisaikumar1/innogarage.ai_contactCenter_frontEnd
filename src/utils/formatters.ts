export const STATUS_LABELS: Record<string, string> = {
  INITIAL_EVALUATION_DONE: 'Initial Evaluation Done',
  AWAITING_RESUME: 'Awaiting Resume',
  RESUME_SHARED: 'Resume Shared',
  MARKETING_STARTED: 'Marketing Started',
  CANDIDATE_GOT_OFFER: 'Candidate Got Offer',
  BGC_ONGOING: 'BGC Ongoing',
  STARTED_WORKING: 'Started Working',
};

export const STATUS_COLORS: Record<string, string> = {
  INITIAL_EVALUATION_DONE: 'bg-slate-100 text-slate-700',
  AWAITING_RESUME: 'bg-amber-100 text-amber-700',
  RESUME_SHARED: 'bg-sky-100 text-sky-700',
  MARKETING_STARTED: 'bg-violet-100 text-violet-700',
  CANDIDATE_GOT_OFFER: 'bg-emerald-100 text-emerald-700',
  BGC_ONGOING: 'bg-orange-100 text-orange-700',
  STARTED_WORKING: 'bg-green-100 text-green-800',
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
