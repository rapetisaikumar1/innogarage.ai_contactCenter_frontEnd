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
  NEW: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200',
  CONTACTED: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200',
  INTERESTED: 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-300',
  DOCUMENTS_PENDING: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300',
  INTERVIEW_SCHEDULED: 'bg-gray-900 text-white ring-1 ring-inset ring-gray-900',
  FOLLOW_UP_REQUIRED: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-400',
  CLOSED_WON: 'bg-gray-900 text-white ring-1 ring-inset ring-gray-900',
  CLOSED_LOST: 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200 line-through decoration-gray-400',
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
