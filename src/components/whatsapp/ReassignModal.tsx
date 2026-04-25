'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAgents, type Agent } from '@/hooks/useAgents';
import { reassignConversation } from '@/hooks/useWhatsApp';

interface Props {
  conversationId: string;
  candidateName: string;
  currentAgentId: string | null;
  onClose: () => void;
  onReassigned: () => void;
}

const AVAIL_DOT: Record<Agent['availability'], string> = {
  AVAILABLE: 'bg-emerald-500',
  BUSY: 'bg-amber-500',
  AWAY: 'bg-slate-400',
  OFFLINE: 'bg-red-500',
};

const AVAIL_LABEL: Record<Agent['availability'], string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  AWAY: 'Away',
  OFFLINE: 'Offline',
};

export default function ReassignModal({
  conversationId,
  candidateName,
  currentAgentId,
  onClose,
  onReassigned,
}: Props) {
  const { agents, loading, error } = useAgents();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Eligible: active agents only, exclude the current assignee
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return agents
      .filter((a) => a.isActive && a.id !== currentAgentId)
      .filter((a) =>
        !term
          ? true
          : a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        // Available first, then by lowest workload
        const order = { AVAILABLE: 0, BUSY: 1, AWAY: 2, OFFLINE: 3 } as const;
        const ao = order[a.availability];
        const bo = order[b.availability];
        if (ao !== bo) return ao - bo;
        return a.assignedConversationCount - b.assignedConversationCount;
      });
  }, [agents, search, currentAgentId]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  async function handleConfirm() {
    if (!selectedId || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await reassignConversation(conversationId, selectedId);
      onReassigned();
      onClose();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Reassignment failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Reassign conversation</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {candidateName ? `Candidate: ${candidateName}` : 'Pick a new agent'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border-0 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* Agent list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-5 text-sm text-slate-400">Loading agents…</div>
          ) : error ? (
            <div className="p-5 text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-sm text-slate-400 text-center">No matching agents</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((agent) => {
                const isSelected = selectedId === agent.id;
                return (
                  <li key={agent.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(agent.id)}
                      className={`w-full text-left flex items-center gap-3 px-5 py-3 transition-colors ${
                        isSelected ? 'bg-violet-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${AVAIL_DOT[agent.availability]}`}
                          aria-label={AVAIL_LABEL[agent.availability]}
                        />
                      </div>
                      {/* Name + meta */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{agent.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {AVAIL_LABEL[agent.availability]} · {agent.assignedConversationCount} active
                        </p>
                      </div>
                      {/* Selection indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          {submitError && (
            <p className="mr-auto text-xs text-red-500">{submitError}</p>
          )}
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || submitting}
            className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Reassigning…' : 'Reassign'}
          </button>
        </div>
      </div>
    </div>
  );
}
