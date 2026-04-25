'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAgents, useAgentCandidates, Availability, Agent, AgentCandidate } from '@/hooks/useAgents';

// ─── Availability config (matches image 1 colours) ────────────────────────────
const AVAIL: Record<Availability, { label: string; dot: string; chip: string }> = {
  AVAILABLE: { label: 'Available', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  BUSY:      { label: 'Busy',      dot: 'bg-amber-400',  chip: 'bg-amber-50  text-amber-700  ring-amber-200'    },
  AWAY:      { label: 'Away',      dot: 'bg-slate-400',  chip: 'bg-slate-100 text-slate-600  ring-slate-200'    },
  OFFLINE:   { label: 'Offline',   dot: 'bg-red-500',    chip: 'bg-red-50    text-red-600    ring-red-200'      },
};

// ─── Candidate status config ──────────────────────────────────────────────────
function candidateStatusChip(status: string) {
  const map: Record<string, string> = {
    INITIAL_EVALUATION_DONE: 'bg-slate-100  text-slate-700  ring-slate-200',
    AWAITING_RESUME:         'bg-amber-50   text-amber-700  ring-amber-200',
    RESUME_SHARED:           'bg-sky-50     text-sky-700    ring-sky-200',
    MARKETING_STARTED:       'bg-violet-50  text-violet-700 ring-violet-200',
    CANDIDATE_GOT_OFFER:     'bg-emerald-50 text-emerald-700 ring-emerald-200',
    BGC_ONGOING:             'bg-orange-50  text-orange-700 ring-orange-200',
    STARTED_WORKING:         'bg-green-50   text-green-700  ring-green-200',
  };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  const label = status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return { cls, label };
}

// ─── Small components ─────────────────────────────────────────────────────────
function AvailChip({ value }: { value: Availability }) {
  const cfg = AVAIL[value] ?? AVAIL.OFFLINE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${cfg.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${dim} rounded-full bg-slate-900 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ avail, count }: { avail: Availability; count: number }) {
  const cfg = AVAIL[avail];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{count}</p>
        <p className="text-xs text-slate-500 mt-0.5">{cfg.label}</p>
      </div>
    </div>
  );
}

// ─── Agent row ────────────────────────────────────────────────────────────────
function AgentRow({
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
    <tr
      onClick={isAdmin ? onClick : undefined}
      className={`border-b border-slate-100 transition-colors duration-100 ${
        isAdmin ? 'cursor-pointer hover:bg-slate-50' : ''
      } ${isSelected ? 'bg-slate-100 hover:bg-slate-100' : ''}`}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={agent.name} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{agent.name}</p>
            <p className="text-xs text-slate-500 truncate">{agent.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <AvailChip value={agent.availability} />
      </td>
      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">
        {agent.assignedConversationCount}
      </td>
      {isAdmin && (
        <td className="px-5 py-3.5 text-right">
          {isSelected ? (
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-full">Viewing</span>
          ) : (
            <span className="text-[11px] text-slate-400 group-hover:text-slate-600">View candidates →</span>
          )}
        </td>
      )}
    </tr>
  );
}

// ─── Candidates panel ─────────────────────────────────────────────────────────
function CandidatesPanel({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const { candidates, loading, error } = useAgentCandidates(agent.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={agent.name} size="sm" />
          <div>
            <p className="text-sm font-bold text-slate-900">{agent.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <AvailChip value={agent.availability} />
              <span className="text-[11px] text-slate-400">{agent.assignedConversationCount} assigned</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-40 text-slate-400 text-sm gap-2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
            Loading candidates…
          </div>
        )}
        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>
        )}
        {!loading && !error && candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No candidates assigned</p>
          </div>
        )}
        {!loading && !error && candidates.length > 0 && (
          <div className="divide-y divide-slate-100">
            {candidates.map((c: AgentCandidate) => {
              const { cls, label } = candidateStatusChip(c.status);
              return (
                <div key={c.candidateId} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <Avatar name={c.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{c.whatsappNumber ?? c.phoneNumber ?? '—'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${cls} whitespace-nowrap`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const { user } = useAuth();
  const { agents, loading, error } = useAgents();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;

  const statuses: Availability[] = ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'];

  function toggle(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? 'View all agents, their availability and assigned candidates.' : 'Your team\'s current availability.'}
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statuses.map((s) => (
          <StatCard key={s} avail={s} count={agents.filter((a) => a.availability === s).length} />
        ))}
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>
      )}

      {/* ── Main content: table + optional panel ─────────────────── */}
      <div className={`gap-5 ${isAdmin && selectedAgent ? 'grid grid-cols-[1fr_360px]' : 'block'}`}>

        {/* Agents table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm gap-2">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              Loading agents…
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">No agents found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
                  {isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <AgentRow
                    key={agent.id}
                    agent={agent}
                    isAdmin={isAdmin}
                    isSelected={selectedId === agent.id}
                    onClick={() => toggle(agent.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Candidates panel (admin only) */}
        {isAdmin && selectedAgent && (
          <CandidatesPanel agent={selectedAgent} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
