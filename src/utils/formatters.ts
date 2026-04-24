export const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  DOCUMENTS_PENDING: 'Documents Pending',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  FOLLOW_UP_REQUIRED: 'Follow-up Required',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-slate-100 text-slate-600',
  CONTACTED: 'bg-sky-100 text-sky-700',
  INTERESTED: 'bg-amber-100 text-amber-700',
  DOCUMENTS_PENDING: 'bg-orange-100 text-orange-700',
  INTERVIEW_SCHEDULED: 'bg-violet-100 text-violet-700',
  FOLLOW_UP_REQUIRED: 'bg-rose-100 text-rose-700',
  CLOSED_WON: 'bg-emerald-100 text-emerald-700',
  CLOSED_LOST: 'bg-red-100 text-red-700',
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
