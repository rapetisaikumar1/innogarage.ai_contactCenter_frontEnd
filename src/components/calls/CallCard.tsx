'use client';

import { Call, formatDuration, deleteCall, CallStatus, clearCallAlerts } from '@/hooks/useCalls';
import { formatDateTime } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const STATUS_STYLES: Record<CallStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  MISSED: 'bg-red-100 text-red-700',
  IN_CALL: 'bg-blue-100 text-blue-700',
};

interface Props {
  call: Call;
  onDeleted: () => void;
}

export default function CallCard({ call, onDeleted }: Props) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [clearingAlerts, setClearingAlerts] = useState(false);

  const canDelete = user?.id === call.loggedById || user?.role === 'ADMIN';
  const canClearAlerts = call.status === 'MISSED' && call.openMissedAlertCount > 0;

  async function handleDelete() {
    if (!window.confirm('Delete this call log?')) return;
    setDeleting(true);
    try {
      await deleteCall(call.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  async function handleClearAlerts() {
    setClearingAlerts(true);
    try {
      await clearCallAlerts(call.id);
      onDeleted();
    } finally {
      setClearingAlerts(false);
    }
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Direction icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        call.direction === 'OUTBOUND' ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        {call.direction === 'OUTBOUND' ? (
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-800 capitalize">{call.direction.toLowerCase()}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[call.status]}`}>
            {call.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">{formatDuration(call.duration)}</span>
        </div>
        {call.notes && <p className="text-xs text-gray-600 mt-0.5 truncate">{call.notes}</p>}
        <p className="text-xs text-gray-400 mt-0.5">{call.loggedBy?.name ?? 'System'} · {formatDateTime(call.createdAt)}</p>
      </div>

      {/* Actions */}
      {canClearAlerts && (
        <button
          onClick={handleClearAlerts}
          disabled={clearingAlerts}
          className="flex-shrink-0 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 hover:bg-red-100 disabled:opacity-50 transition-colors"
          title="Clear missed-call alerts"
        >
          {clearingAlerts ? 'Clearing...' : 'Clear Alerts'}
        </button>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1"
          title="Delete call log"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
