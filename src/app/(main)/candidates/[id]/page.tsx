'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useCandidateDetail, updateCandidateStatus, getPendingTransferRequest, respondToTransferRequest, TransferRequest } from '@/hooks/useCandidates';
import StatusBadge from '@/components/candidates/StatusBadge';
import CandidateForm from '@/components/candidates/CandidateForm';
import TransferRequestModal from '@/components/candidates/TransferRequestModal';
import NotesList from '@/components/candidates/NotesList';
import FilesList from '@/components/candidates/FilesList';
import CallsList from '@/components/calls/CallsList';
import FollowUpCard from '@/components/follow-ups/FollowUpCard';
import FollowUpForm from '@/components/follow-ups/FollowUpForm';
import { useFollowUpsByCandidate } from '@/hooks/useFollowUps';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatDateTime, STATUS_LABELS } from '@/utils/formatters';
import { CandidateStatus } from '@/types/candidate';
import Link from 'next/link';

const ALL_STATUSES = Object.keys(STATUS_LABELS) as CandidateStatus[];

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { candidate, isLoading, error, refetch } = useCandidateDetail(id);
  const { followUps, refetch: refetchFollowUps } = useFollowUpsByCandidate(id);
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'files' | 'calls' | 'history'>('overview');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<TransferRequest | null | undefined>(undefined);
  const [respondingTransfer, setRespondingTransfer] = useState(false);

  // Load pending transfer request whenever candidate changes
  useEffect(() => {
    if (!id) return;
    getPendingTransferRequest(id).then(setPendingTransfer).catch(() => setPendingTransfer(null));
  }, [id]);

  async function handleRespondTransfer(action: 'accept' | 'reject') {
    if (!pendingTransfer) return;
    setRespondingTransfer(true);
    try {
      await respondToTransferRequest(id, pendingTransfer.id, action);
      setPendingTransfer(null);
      refetch();
    } catch {
      // ignore
    } finally {
      setRespondingTransfer(false);
    }
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!candidate) return;
    setUpdatingStatus(true);
    try {
      await updateCandidateStatus(candidate.id, e.target.value);
      refetch();
    } catch {
      // error silently — user sees stale data
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (error || !candidate) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-sm text-slate-500">{error ?? 'Candidate not found'}</p>
      <Link href="/candidates" className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-700 transition-colors">
        ← Back to Candidates
      </Link>
    </div>
  );

  const assignedTo = candidate.assignments[0]?.user;

  // Transfer button state for agents
  const isAssignedAgent = user?.role === 'AGENT' && assignedTo?.id === user?.id;
  const isTransferTarget = pendingTransfer?.toAgentId === user?.id;
  const isTransferRequester = pendingTransfer?.fromAgentId === user?.id;

  return (
    <div className="space-y-0 pb-8">
      {/* ── Back link ────────────────────────────────────────────────────── */}
      <div className="pt-4 pb-4">
        <Link
          href="/candidates"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Candidates
        </Link>
      </div>

      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-slate-900" />

        <div className="px-6 pt-6 pb-7">
          {/* Name row + actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 select-none">
                {candidate.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{candidate.fullName}</h1>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                  {candidate.phoneNumber && (
                    <span className="text-sm text-slate-500">{candidate.phoneNumber}</span>
                  )}
                  {candidate.email && (
                    <>
                      <span className="text-slate-300 select-none">·</span>
                      <span className="text-sm text-slate-500">{candidate.email}</span>
                    </>
                  )}
                  {candidate.city && (
                    <>
                      <span className="text-slate-300 select-none">·</span>
                      <span className="text-sm text-slate-500">{candidate.city}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <select
                value={candidate.status}
                onChange={handleStatusChange}
                disabled={updatingStatus}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 cursor-pointer"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button
                onClick={() => setShowEdit(true)}
                className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Edit
              </button>

              {/* Transfer request buttons — only shown to the assigned agent */}
              {isAssignedAgent && !pendingTransfer && (
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-4 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Transfer
                </button>
              )}
              {isAssignedAgent && isTransferRequester && pendingTransfer && (
                <span
                  title={`Transfer requested to ${pendingTransfer.toAgent.name}`}
                  className="px-4 py-2 text-sm font-semibold bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed opacity-60 select-none"
                >
                  Transfer Requested
                </span>
              )}
              {isTransferTarget && pendingTransfer && (
                <>
                  <button
                    onClick={() => handleRespondTransfer('accept')}
                    disabled={respondingTransfer}
                    className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    Accept Transfer
                  </button>
                  <button
                    onClick={() => handleRespondTransfer('reject')}
                    disabled={respondingTransfer}
                    className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Info grid */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Preferred Technology</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{candidate.preferredRole ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Visa Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{candidate.experience ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Assigned To</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{assignedTo?.name ?? 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Added</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(candidate.createdAt)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">WhatsApp</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{candidate.whatsappNumber ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Country</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{candidate.source ?? '—'}</p>
            </div>
            {candidate.qualification && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Qualification</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{candidate.qualification}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs bar ─────────────────────────────────────────────────────── */}
      <div className="mt-5 flex gap-0 border-b border-slate-200">
        {(['overview', 'notes', 'files', 'calls', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === t
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {t === 'history' ? 'Status History' : t === 'calls' ? 'Call Logs' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Follow-ups</h3>
              <button
                onClick={() => setShowFollowUpForm(true)}
                className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition-colors"
              >
                + Schedule
              </button>
            </div>
            {followUps.length === 0 ? (
              <p className="text-sm text-slate-400">No follow-ups scheduled.</p>
            ) : (
              <div className="space-y-2">
                {followUps.map((fu) => (
                  <FollowUpCard key={fu.id} followUp={fu} onUpdated={refetchFollowUps} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Notes</h3>
          <NotesList candidateId={id} />
        </div>
      )}

      {activeTab === 'files' && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Files</h3>
          <FilesList candidateId={id} />
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Call Logs</h3>
          <CallsList candidateId={id} phoneNumber={candidate.phoneNumber} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Status History</h3>
          {candidate.statusHistory.length === 0 ? (
            <p className="text-sm text-slate-400">No status changes yet.</p>
          ) : (
            <ul className="space-y-3">
              {candidate.statusHistory.map((h) => (
                <li key={h.id} className="flex items-center gap-3 text-sm">
                  <StatusBadge status={h.oldStatus} />
                  <span className="text-slate-400">→</span>
                  <StatusBadge status={h.newStatus} />
                  <span className="text-slate-500 ml-auto text-xs">{h.changedBy.name} · {formatDateTime(h.changedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Follow-up Modal ───────────────────────────────────────────────── */}
      {showFollowUpForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Schedule Follow-up</h2>
            <FollowUpForm
              candidateId={id}
              onSuccess={() => { setShowFollowUpForm(false); refetchFollowUps(); }}
              onCancel={() => setShowFollowUpForm(false)}
            />
          </div>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Edit Candidate</h2>
            <CandidateForm
              candidate={candidate}
              onSuccess={() => { setShowEdit(false); refetch(); }}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}

      {/* ── Transfer Request Modal ─────────────────────────────────────────── */}
      {showTransferModal && assignedTo && (
        <TransferRequestModal
          candidateId={id}
          candidateName={candidate.fullName}
          currentAgentId={assignedTo.id}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false);
            getPendingTransferRequest(id).then(setPendingTransfer).catch(() => setPendingTransfer(null));
          }}
        />
      )}
    </div>
  );
}
