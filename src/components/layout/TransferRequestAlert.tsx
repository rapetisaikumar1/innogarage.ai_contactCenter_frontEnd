'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { respondToTransferRequest } from '@/hooks/useCandidates';
import { AppNotification } from '@/hooks/useNotifications';

interface TransferAlert {
  notificationId: string;
  requestId: string;
  candidateId: string;
  body: string;
}

type ActionState = 'idle' | 'accepting' | 'done';

export default function TransferRequestAlert() {
  const [queue, setQueue] = useState<TransferAlert[]>([]);
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [doneMessage, setDoneMessage] = useState('');

  // Listen for incoming transfer request notifications in real-time
  useSocket({
    'agent:notification:new': (data: unknown) => {
      const n = data as AppNotification;
      if (n.type !== 'TRANSFER_REQUEST') return;
      const meta = n.metadata as { requestId?: string; candidateId?: string } | null;
      if (!meta?.requestId || !meta?.candidateId) return;

      setQueue((prev) => {
        if (prev.some((a) => a.notificationId === n.id)) return prev;
        return [
          ...prev,
          {
            notificationId: n.id,
            requestId: meta.requestId!,
            candidateId: meta.candidateId!,
            body: n.body,
          },
        ];
      });
    },
  });

  const current = queue[0];

  function dismiss() {
    setQueue((prev) => prev.slice(1));
    setActionState('idle');
    setDoneMessage('');
  }

  async function handleAccept() {
    if (!current || actionState !== 'idle') return;
    setActionState('accepting');
    try {
      await respondToTransferRequest(current.candidateId, current.requestId, 'accept');
      setDoneMessage('Transfer accepted. This candidate is now assigned to you.');
      setActionState('done');
      setTimeout(dismiss, 3000);
    } catch {
      setActionState('idle');
    }
  }

  if (!current) return null;

  return (
    <div
      className="alert-slide-in w-full max-w-[44rem] rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 px-3 py-2 shadow-sm"
      role="status"
      aria-modal="false"
      aria-label="Incoming Transfer Request"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl border border-indigo-100 bg-white flex items-center justify-center text-indigo-500 flex-shrink-0 shadow-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h3m4 4l-4-4H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2h-1v4z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {actionState === 'done' ? doneMessage : current.body}
          </p>
          {actionState !== 'done' && (
            <p className="text-xs text-slate-500 truncate">
              Accept to move this candidate and WhatsApp conversation to your queue.
            </p>
          )}
        </div>
        {queue.length > 1 && actionState === 'idle' && (
          <span className="hidden md:inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-semibold text-indigo-700 flex-shrink-0">
            +{queue.length - 1}
          </span>
        )}
        {actionState === 'idle' && (
          <button
            onClick={handleAccept}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 flex-shrink-0"
          >
            Accept Request
          </button>
        )}
        {actionState === 'accepting' && (
          <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm flex-shrink-0">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Accepting...
          </div>
        )}
        <button
          onClick={dismiss}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors flex-shrink-0"
          aria-label="Dismiss transfer request"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
