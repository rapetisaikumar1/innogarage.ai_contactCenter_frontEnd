'use client';

import Link from 'next/link';
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { STATUS_LABELS, STATUS_COLORS, formatDateTime } from '@/utils/formatters';
import { formatDuration } from '@/hooks/useCalls';

const STATUS_BAR: Record<string, string> = {
  INITIAL_EVALUATION_DONE: 'bg-gradient-to-r from-slate-400 to-slate-500',
  AWAITING_RESUME:         'bg-gradient-to-r from-amber-400 to-amber-500',
  RESUME_SHARED:           'bg-gradient-to-r from-sky-400 to-sky-600',
  MARKETING_STARTED:       'bg-gradient-to-r from-violet-500 to-violet-600',
  CANDIDATE_GOT_OFFER:     'bg-gradient-to-r from-emerald-400 to-emerald-600',
  BGC_ONGOING:             'bg-gradient-to-r from-orange-400 to-orange-600',
  STARTED_WORKING:         'bg-gradient-to-r from-green-500 to-green-600',
};

// ─── Compact KPI card ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, iconBg, href }: {
  label: string; value: number | string; sub?: string;
  icon: React.ReactNode; iconBg: string; href?: string;
}) {
  const inner = (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3 h-full ${href ? 'hover:border-slate-300 hover:shadow-md transition-all duration-150' : ''}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight tabular-nums mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 leading-none mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}

// ─── Panel with fixed header + scrollable body ────────────────────────────────
function Panel({ title, viewHref, children, className = '' }: {
  title: string; viewHref?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</h2>
        {viewHref && (
          <Link href={viewHref} className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors">
            View all →
          </Link>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full py-6 text-slate-400 text-xs">{message}</div>
  );
}

// ─── Pulse skeleton ───────────────────────────────────────────────────────────
function Pulse({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useDashboard();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 leading-none mt-0.5">Overview of your contact center activity</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Welcome message ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 bg-white">
        <h2 className="text-xl font-bold text-slate-900">
          Welcome back, <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg ring-1 ring-sky-100">{user?.name ?? 'there'}</span>! 👋
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Here&apos;s what&apos;s happening with your contact center today.</p>
      </div>

      {error && (
        <div className="flex-shrink-0 mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">{error}</div>
      )}

      {/* ── KPI row ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))
        ) : data ? (
          <>
            <StatCard label="Total Candidates" value={data.totalCandidates} sub="All time" iconBg="bg-indigo-50" href="/candidates"
              icon={<svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard label="Today's Follow-ups" value={data.todayFollowUps} sub="Due today" iconBg="bg-sky-50" href="/follow-ups"
              icon={<svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard label="Calls Today" value={data.totalCallsToday} sub="Logged today" iconBg="bg-emerald-50" href="/calls"
              icon={<svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            />
            <StatCard label="Messages Today" value={data.totalMessagesToday} sub="WhatsApp" iconBg="bg-green-50" href="/inbox"
              icon={<svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" /></svg>}
            />
          </>
        ) : null}
      </div>

      {/* ── Content grid ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 px-5 pt-2 pb-4 flex gap-4">

        {/* Left column */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Candidates by status */}
          <Panel title="Candidates by Status" viewHref="/candidates" className="flex-1 min-h-0">
            {isLoading ? <Pulse rows={5} /> : data && data.candidatesByStatus.length > 0 ? (
              <div className="px-4 py-3 space-y-2.5">
                {data.candidatesByStatus.map((s) => {
                  const pct = data.totalCandidates > 0 ? Math.round((s.count / data.totalCandidates) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${STATUS_COLORS[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 tabular-nums">{s.count}</span>
                          <span className="text-[10px] text-slate-400 tabular-nums w-7 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${STATUS_BAR[s.status] ?? 'bg-slate-300'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <Empty message="No candidates yet" />}
          </Panel>

          {/* Recent calls */}
          <Panel title="Recent Calls" viewHref="/calls" className="flex-1 min-h-0">
            {isLoading ? <Pulse /> : data && data.recentCalls.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.recentCalls.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${c.direction === 'OUTBOUND' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                      <svg className={`w-3.5 h-3.5 ${c.direction === 'OUTBOUND' ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/candidates/${c.candidate.id}`} className="text-xs font-semibold text-slate-800 hover:text-slate-900 truncate block transition-colors">
                        {c.candidate.fullName}
                      </Link>
                      <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                        {c.direction === 'OUTBOUND' ? 'Outbound' : 'Inbound'} · {c.status.replace('_', ' ').toLowerCase()} · {formatDuration(c.duration)}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">{formatDateTime(c.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : <Empty message="No calls logged yet" />}
          </Panel>
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Recent messages */}
          <Panel title="Recent WhatsApp Messages" viewHref="/inbox" className="flex-1 min-h-0">
            {isLoading ? <Pulse rows={4} /> : data && data.recentMessages.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.recentMessages.map((m) => (
                  <li key={m.candidateId} className="px-4 py-2.5">
                    <Link href={`/inbox/${m.candidateId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[11px] font-bold">
                        {m.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800 truncate">{m.candidateName}</span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{formatDateTime(m.lastMessageAt)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                          {m.lastDirection === 'OUTBOUND' && <span className="text-slate-500 font-bold mr-1">→</span>}
                          {m.lastMessage}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <Empty message="No messages yet" />}
          </Panel>

          {/* Recently added candidates */}
          <Panel title="Recently Added Candidates" viewHref="/candidates" className="flex-1 min-h-0">
            {isLoading ? <Pulse /> : data && data.recentCandidates.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.recentCandidates.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold">
                      {c.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/candidates/${c.id}`} className="text-xs font-semibold text-slate-800 hover:text-slate-900 truncate block transition-colors">
                        {c.fullName}
                      </Link>
                      <p className="text-[10px] text-slate-400 leading-none mt-0.5">{c.phoneNumber}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0 ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <Empty message="No candidates yet" />}
          </Panel>
        </div>

      </div>
    </div>
  );
}

