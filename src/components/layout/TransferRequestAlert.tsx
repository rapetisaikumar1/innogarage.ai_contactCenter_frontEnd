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

type ActionState = 'idle' | 'accepting' | 'rejecting' | 'done';

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
      setDoneMessage('Transfer accepted. The candidate is now assigned to you.');
      setActionState('done');
      setTimeout(dismiss, 3000);
    } catch {
      setActionState('idle');
    }
  }

  async function handleReject() {
    if (!current || actionState !== 'idle') return;
    setActionState('rejecting');
    try {
      await respondToTransferRequest(current.candidateId, current.requestId, 'reject');
      setDoneMessage('Transfer request declined.');
      setActionState('done');
      setTimeout(dismiss, 2000);
    } catch {
      setActionState('idle');
    }
  }

  if (!current) return null;

  return (
    <div
      className="alert-slide-in fixed top-16 right-4 z-[100] w-[22rem] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      role="alertdialog"
      aria-modal="false"
      aria-label="Incoming Transfer Request"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-900 text-white">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          {/* Transfer arrows icon */}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Incoming Transfer Request</p>
          <p className="text-xs text-white/60 mt-0.5">Your response is required</p>
        </div>
        {actionState === 'idle' && (
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4">
        {actionState === 'done' ? (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{doneMessage}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-700 leading-relaxed">{current.body}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Accepting will assign this candidate to you. You can also decline if you are unable to take on this candidate right now.
            </p>
            {queue.length > 1 && (
              <p className="text-xs text-amber-600 font-medium mt-2.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {queue.length - 1} more pending request{queue.length - 1 > 1 ? 's' : ''}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Actions ── */}
      {actionState !== 'done' && (
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleAccept}
            disabled={actionState !== 'idle'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actionState === 'accepting' ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Accepting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Accept Transfer
              </>
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={actionState !== 'idle'}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actionState === 'rejecting' ? (
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              'Decline'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
