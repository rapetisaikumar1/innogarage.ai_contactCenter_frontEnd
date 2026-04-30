'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAgents, type Agent } from '@/hooks/useAgents';
import { createTransferRequest } from '@/hooks/useCandidates';

interface Props {
  conversationId: string;
  candidateId: string;
  candidateName: string;
  currentAgentId: string | null;
  onClose: () => void;
  onRequestSent: () => void;
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

const ALL_DEPARTMENTS = 'ALL';

export default function TransferModal({
  candidateId,
  candidateName,
  currentAgentId,
  onClose,
  onRequestSent,
}: Props) {
  const { agents, loading, error } = useAgents();
  const [search, setSearch] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(ALL_DEPARTMENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const departments = useMemo(() => {
    const byId = new Map<string, string>();
    agents.forEach((agent) => {
      if (agent.department) byId.set(agent.department.id, agent.department.name);
    });
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [agents]);

  // Eligible: active agents only, exclude the current assignee
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return agents
      .filter((a) => a.isActive && a.id !== currentAgentId)
      .filter((a) => selectedDepartmentId === ALL_DEPARTMENTS || a.departmentId === selectedDepartmentId)
      .filter((a) =>
        !term
          ? true
          : a.name.toLowerCase().includes(term) ||
            a.email.toLowerCase().includes(term) ||
            (a.department?.name.toLowerCase().includes(term) ?? false)
      )
      .sort((a, b) => {
        const order = { AVAILABLE: 0, BUSY: 1, AWAY: 2, OFFLINE: 3 } as const;
        const ao = order[a.availability];
        const bo = order[b.availability];
        if (ao !== bo) return ao - bo;
        return a.assignedConversationCount - b.assignedConversationCount;
      });
  }, [agents, search, currentAgentId, selectedDepartmentId]);

  const selectedAgent = filtered.find((agent) => agent.id === selectedId) ?? null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  async function handleConfirm() {
    if (!selectedAgent || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const departmentId = selectedDepartmentId === ALL_DEPARTMENTS ? undefined : selectedDepartmentId;
      await createTransferRequest(candidateId, selectedAgent.id, departmentId);
      onRequestSent();
      onClose();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Transfer request failed');
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
            <h2 className="text-base font-semibold text-slate-900">Transfer conversation</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {candidateName ? `Candidate: ${candidateName}` : 'Pick an agent to transfer to'}
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

        {/* Department and search */}
        <div className="px-5 py-3 border-b border-slate-100 space-y-3">
          <div>
            <label htmlFor="transfer-department" className="block text-xs font-semibold text-slate-600 mb-1">
              Department
            </label>
            <select
              id="transfer-department"
              value={selectedDepartmentId}
              onChange={(event) => {
                setSelectedDepartmentId(event.target.value);
                setSelectedId(null);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-100 border-0 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value={ALL_DEPARTMENTS}>All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mentors…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border-0 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* Agent list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-5 text-sm text-slate-400">Loading mentors…</div>
          ) : error ? (
            <div className="p-5 text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-sm text-slate-400 text-center">No matching mentors</div>
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
                        isSelected ? 'bg-slate-50' : 'hover:bg-slate-50'
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
                          {agent.department?.name ?? 'No department'} · {AVAIL_LABEL[agent.availability]} · {agent.assignedConversationCount} active
                        </p>
                      </div>
                      {/* Selection indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
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
            disabled={!selectedAgent || submitting}
            className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sending Request…' : 'Send Transfer Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
