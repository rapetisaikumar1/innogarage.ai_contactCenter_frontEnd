'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useAgents,
  useAgentCandidates,
  updateMyAvailability,
  Availability,
  Agent,
} from '@/hooks/useAgents';

// ─── Availability chip ─────────────────────────────────────────────────────────
const AVAIL_CONFIG: Record<Availability, { label: string; dot: string; bg: string; text: string }> = {
  AVAILABLE: { label: 'Available', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  BUSY:      { label: 'Busy',      dot: 'bg-amber-400',  bg: 'bg-amber-50',   text: 'text-amber-700'  },
  AWAY:      { label: 'Away',      dot: 'bg-slate-400',  bg: 'bg-slate-100',  text: 'text-slate-600'  },
  OFFLINE:   { label: 'Offline',   dot: 'bg-red-500',    bg: 'bg-red-50',     text: 'text-red-600'    },
};

function AvailabilityChip({ value }: { value: Availability }) {
  const cfg = AVAIL_CONFIG[value] ?? AVAIL_CONFIG.OFFLINE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Agent card ────────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  isAdmin,
  isSelected,
  onClick,
}: {
  agent: Agent;
  isAdmin: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={isAdmin ? onClick : undefined}
      className={`p-4 rounded-2xl border transition-all duration-150 ${
        isAdmin ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      } ${isSelected ? 'border-violet-400 bg-violet-50 shadow-md' : 'border-slate-200 bg-white'}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {agent.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{agent.name}</p>
          <p className="text-xs text-slate-500 truncate">{agent.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AvailabilityChip value={agent.availability} />
          <span className="text-[11px] text-slate-400">{agent.assignedConversationCount} assigned</span>
        </div>
      </div>
    </div>
  );
}

// ─── Candidates panel (admin only) ────────────────────────────────────────────
function CandidatesPanel({ agentId, agentName }: { agentId: string; agentName: string }) {
  const { candidates, loading, error } = useAgentCandidates(agentId);

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Loading candidates…
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
    );

  if (candidates.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm">No candidates assigned to {agentName}</p>
      </div>
    );

  return (
    <div className="space-y-2">
      {candidates.map((c) => (
        <div
          key={c.candidateId}
          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold flex-shrink-0">
            {c.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{c.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{c.whatsappNumber ?? c.phoneNumber ?? '—'}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              c.conversationStatus === 'ASSIGNED'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {c.conversationStatus}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              c.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700'
                : c.status === 'INACTIVE'
                ? 'bg-slate-100 text-slate-500'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {c.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Availability selector (for agents — update own status) ───────────────────
function AvailabilitySelector({ current, onUpdate }: { current: Availability; onUpdate: (a: Availability) => void }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(a: Availability) {
    setSaving(true);
    try {
      await updateMyAvailability(a);
      onUpdate(a);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 mr-1">My status:</span>
      {(['AVAILABLE', 'BUSY', 'OFFLINE'] as Availability[]).map((a) => {
        const cfg = AVAIL_CONFIG[a];
        return (
          <button
            key={a}
            disabled={saving}
            onClick={() => handleChange(a)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              current === a
                ? `${cfg.bg} ${cfg.text} border-current`
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            } disabled:opacity-50`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const { user } = useAuth();
  const { agents, loading, error, refetch } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  function handleSelectAgent(id: string) {
    setSelectedAgentId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAdmin ? 'Manage agent availability and assigned candidates' : 'Your team status'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          Loading agents…
        </div>
      )}

      {!loading && (
        <div className={`gap-6 ${isAdmin && selectedAgentId ? 'grid grid-cols-2' : ''}`}>
          {/* Agent list */}
          <div className="space-y-3">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {(['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'] as Availability[]).map((a) => {
                const count = agents.filter((ag) => ag.availability === a).length;
                const cfg = AVAIL_CONFIG[a];
                return (
                  <div key={a} className={`p-3 rounded-xl border ${cfg.bg} border-transparent`}>
                    <p className={`text-lg font-bold ${cfg.text}`}>{count}</p>
                    <p className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</p>
                  </div>
                );
              })}
            </div>

            {agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">No agents found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isAdmin={isAdmin}
                    isSelected={selectedAgentId === agent.id}
                    onClick={() => handleSelectAgent(agent.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Candidates side panel */}
          {isAdmin && selectedAgent && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedAgent.name}'s Candidates</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedAgent.assignedConversationCount} assigned conversation{selectedAgent.assignedConversationCount !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setSelectedAgentId(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CandidatesPanel agentId={selectedAgent.id} agentName={selectedAgent.name} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
