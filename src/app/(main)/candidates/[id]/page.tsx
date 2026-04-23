'use client';

import { useState } from 'react';
import { use } from 'react';
import { useCandidateDetail, updateCandidateStatus } from '@/hooks/useCandidates';
import StatusBadge from '@/components/candidates/StatusBadge';
import CandidateForm from '@/components/candidates/CandidateForm';
import NotesList from '@/components/candidates/NotesList';
import FilesList from '@/components/candidates/FilesList';
import CallsList from '@/components/calls/CallsList';
import FollowUpCard from '@/components/follow-ups/FollowUpCard';
import FollowUpForm from '@/components/follow-ups/FollowUpForm';
import { useFollowUpsByCandidate } from '@/hooks/useFollowUps';
import { initiateCall } from '@/hooks/useCalls';
import { formatDate, formatDateTime, STATUS_LABELS } from '@/utils/formatters';
import { CandidateStatus } from '@/types/candidate';
import Link from 'next/link';

const ALL_STATUSES = Object.keys(STATUS_LABELS) as CandidateStatus[];

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { candidate, isLoading, error, refetch } = useCandidateDetail(id);
  const { followUps, refetch: refetchFollowUps } = useFollowUpsByCandidate(id);
  const [showEdit, setShowEdit] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'files' | 'calls' | 'history'>('overview');
  const [calling, setCalling] = useState(false);
  const [callMessage, setCallMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleCall() {
    if (!candidate) return;
    setCalling(true);
    setCallMessage(null);
    try {
      await initiateCall(candidate.id);
      setCallMessage({ type: 'success', text: 'Call initiated! Check your phone.' });
      setActiveTab('calls');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate call';
      setCallMessage({ type: 'error', text: msg });
    } finally {
      setCalling(false);
      setTimeout(() => setCallMessage(null), 5000);
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
  if (error || !candidate) return <div className="p-8 text-sm text-red-600">{error ?? 'Candidate not found'}</div>;

  const assignedTo = candidate.assignments[0]?.user;

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Back link */}
      <Link href="/candidates" className="text-sm text-blue-600 hover:underline">← Back to Candidates</Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{candidate.fullName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{candidate.phoneNumber}{candidate.email ? ` · ${candidate.email}` : ''}</p>
            {candidate.city && <p className="text-sm text-gray-500">{candidate.city}</p>}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={candidate.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <Link
              href={`/inbox/${id}`}
              className="px-3 py-1.5 text-sm border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
              WhatsApp
            </Link>
            <button
              onClick={handleCall}
              disabled={calling}
              className="px-3 py-1.5 text-sm border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {calling ? 'Calling...' : 'Call'}
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Call feedback toast */}
        {callMessage && (
          <div className={`mt-3 px-4 py-2 rounded-lg text-sm ${callMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {callMessage.text}
          </div>
        )}

        {/* Key info row */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
          <div>
            <span className="text-gray-500">Preferred Role</span>
            <p className="font-medium text-gray-800 mt-0.5">{candidate.preferredRole ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Experience</span>
            <p className="font-medium text-gray-800 mt-0.5">{candidate.experience ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Assigned To</span>
            <p className="font-medium text-gray-800 mt-0.5">{assignedTo?.name ?? 'Unassigned'}</p>
          </div>
          <div>
            <span className="text-gray-500">WhatsApp</span>
            <p className="font-medium text-gray-800 mt-0.5">{candidate.whatsappNumber ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Source</span>
            <p className="font-medium text-gray-800 mt-0.5">{candidate.source ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Added</span>
            <p className="font-medium text-gray-800 mt-0.5">{formatDate(candidate.createdAt)}</p>
          </div>
        </div>

        {candidate.skills && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
            <span className="text-gray-500">Skills</span>
            <p className="text-gray-800 mt-0.5">{candidate.skills}</p>
          </div>
        )}
        {candidate.qualification && (
          <div className="mt-2 text-sm">
            <span className="text-gray-500">Qualification</span>
            <p className="text-gray-800 mt-0.5">{candidate.qualification}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['overview', 'notes', 'files', 'calls', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab === 'history' ? 'Status History' : tab === 'calls' ? 'Call Logs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Follow-ups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Follow-ups</h3>
              <button
                onClick={() => setShowFollowUpForm(true)}
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Schedule
              </button>
            </div>
            {followUps.length === 0 ? (
              <p className="text-sm text-gray-400">No follow-ups scheduled.</p>
            ) : (
              <div>
                {followUps.map((fu) => (
                  <FollowUpCard key={fu.id} followUp={fu} onUpdated={refetchFollowUps} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
          <NotesList candidateId={id} />
        </div>
      )}

      {activeTab === 'files' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Files</h3>
          <FilesList candidateId={id} />
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Call Logs</h3>
          <CallsList candidateId={id} phoneNumber={candidate.phoneNumber} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Status History</h3>
          {candidate.statusHistory.length === 0 ? (
            <p className="text-sm text-gray-400">No status changes yet.</p>
          ) : (
            <ul className="space-y-3">
              {candidate.statusHistory.map((h) => (
                <li key={h.id} className="flex items-center gap-3 text-sm">
                  <StatusBadge status={h.oldStatus} />
                  <span className="text-gray-400">→</span>
                  <StatusBadge status={h.newStatus} />
                  <span className="text-gray-500 ml-auto">{h.changedBy.name} · {formatDateTime(h.changedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Follow-up Form Modal */}
      {showFollowUpForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Schedule Follow-up</h2>
            <FollowUpForm
              candidateId={id}
              onSuccess={() => { setShowFollowUpForm(false); refetchFollowUps(); }}
              onCancel={() => setShowFollowUpForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Candidate</h2>
            <CandidateForm
              candidate={candidate}
              onSuccess={() => { setShowEdit(false); refetch(); }}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
