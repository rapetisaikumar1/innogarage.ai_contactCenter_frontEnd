'use client';

import Link from 'next/link';
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { STATUS_LABELS, STATUS_COLORS, formatDateTime } from '@/utils/formatters';
import { formatDuration } from '@/hooks/useCalls';

// ─── Status bar color mapping ─────────────────────────────────────────────────
const STATUS_BAR_COLORS: Record<string, string> = {
  NEW:                  'bg-slate-400',
  CONTACTED:            'bg-sky-500',
  INTERESTED:           'bg-amber-400',
  DOCUMENTS_PENDING:    'bg-orange-500',
  INTERVIEW_SCHEDULED:  'bg-violet-500',
  FOLLOW_UP_REQUIRED:   'bg-pink-500',
  CLOSED_WON:           'bg-emerald-500',
  CLOSED_LOST:          'bg-red-400',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, accent, href, trend,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent: string; // Tailwind colour prefix e.g. 'indigo'
  href?: string;
  trend?: { value: string; up: boolean };
}) {
  const accentMap: Record<string, { bg: string; text: string; ring: string; iconBg: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', iconBg: 'bg-indigo-100' },
    sky:    { bg: 'bg-sky-50',    text: 'text-sky-600',    ring: 'ring-sky-100',    iconBg: 'bg-sky-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  ring: 'ring-amber-100',  iconBg: 'bg-amber-100' },
    emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',ring: 'ring-emerald-100',iconBg: 'bg-emerald-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  ring: 'ring-green-100',  iconBg: 'bg-green-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', iconBg: 'bg-violet-100' },
  };
  const c = accentMap[accent] ?? accentMap.indigo;

  const inner = (
    <div className={`group relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 overflow-hidden transition-all duration-200 ${href ? 'hover:border-slate-300 hover:shadow-md cursor-pointer' : ''}`}>
      {/* Subtle background tint */}
      <div className={`absolute inset-0 opacity-0 ${c.bg} ${href ? 'group-hover:opacity-30' : ''} transition-opacity pointer-events-none`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={c.text}>{icon}</span>
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="relative">
        <p className="text-3xl font-extrabold text-slate-900 leading-none tabular-nums">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-1.5 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, viewHref, viewLabel = 'View all' }: { title: string; viewHref?: string; viewLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      {viewHref && (
        <Link href={viewHref} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
          {viewLabel}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
      <svg className="w-8 h-8 mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Direction badge ──────────────────────────────────────────────────────────
function DirectionBadge({ direction }: { direction: string }) {
  const isOut = direction === 'OUTBOUND';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${isOut ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
      {isOut ? '↑' : '↓'} {isOut ? 'Out' : 'In'}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 text-sm max-w-sm text-center">
          <p className="font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  const activePipeline = data?.candidatesByStatus
    .filter(s => !['CLOSED_WON', 'CLOSED_LOST'].includes(s.status))
    .reduce((a, b) => a + b.count, 0) ?? 0;

  return (
    <div className="min-h-full bg-slate-50">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">{today}</p>
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* ── KPI grid ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : data && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              label="Total Candidates" value={data.totalCandidates} sub="All time" accent="indigo" href="/candidates"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard
              label="Active Pipeline" value={activePipeline} sub="Excl. closed" accent="violet" href="/candidates"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
            />
            <StatCard
              label="Today's Follow-ups" value={data.todayFollowUps} sub="Due today" accent="sky" href="/follow-ups"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard
              label="Overdue" value={data.overdueFollowUps} sub="Needs attention" accent="amber" href="/follow-ups"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard
              label="Calls Today" value={data.totalCallsToday} sub="Logged today" accent="emerald" href="/calls"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            />
            <StatCard
              label="Messages Today" value={data.totalMessagesToday} sub="WhatsApp" accent="green" href="/inbox"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" /></svg>}
            />
          </div>
        )}

        {/* ── Mid row: Alerts + Pipeline breakdown ─────────────────────── */}
        {data && (data.overdueFollowUps > 0 || data.todayFollowUps > 0) && (
          <div className="flex flex-wrap gap-3">
            {data.overdueFollowUps > 0 && (
              <Link href="/follow-ups" className="flex items-center gap-3 bg-red-50 border border-red-200 hover:border-red-300 rounded-xl px-4 py-3 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.75L13.75 4a2 2 0 00-3.5 0l-6.25 11.25A2 2 0 005.07 19z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">{data.overdueFollowUps} overdue follow-up{data.overdueFollowUps !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-red-500">Tap to review →</p>
                </div>
              </Link>
            )}
            {data.todayFollowUps > 0 && (
              <Link href="/follow-ups" className="flex items-center gap-3 bg-sky-50 border border-sky-200 hover:border-sky-300 rounded-xl px-4 py-3 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-sky-700">{data.todayFollowUps} follow-up{data.todayFollowUps !== 1 ? 's' : ''} due today</p>
                  <p className="text-xs text-sky-500">Tap to review →</p>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* ── Main content grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Pipeline status breakdown — spans 1 col */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <SectionHeader title="Candidate Pipeline" viewHref="/candidates" />
            {isLoading ? (
              <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-7" />)}</div>
            ) : data && data.candidatesByStatus.length > 0 ? (
              <div className="space-y-3.5">
                {data.candidatesByStatus.map((s) => {
                  const pct = data.totalCandidates > 0 ? Math.round((s.count / data.totalCandidates) * 100) : 0;
                  const barColor = STATUS_BAR_COLORS[s.status] ?? 'bg-slate-300';
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${STATUS_COLORS[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700 tabular-nums">{s.count}</span>
                          <span className="text-xs text-slate-400 tabular-nums w-7 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <Empty message="No candidates yet" />}
          </div>

          {/* Recent calls + messages — spans 2 cols */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent calls */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <SectionHeader title="Recent Calls" viewHref="/calls" />
              {isLoading ? (
                <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : data && data.recentCalls.length > 0 ? (
                <ul className="divide-y divide-slate-100 -mx-1">
                  {data.recentCalls.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 py-3 px-1 first:pt-0 last:pb-0">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${c.direction === 'OUTBOUND' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        <svg className={`w-4 h-4 ${c.direction === 'OUTBOUND' ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/candidates/${c.candidate.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 truncate block transition-colors">
                          {c.candidate.fullName}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <DirectionBadge direction={c.direction} />
                          <span className="text-xs text-slate-400">{formatDuration(c.duration)}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 flex-shrink-0 whitespace-nowrap leading-tight text-right">{formatDateTime(c.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : <Empty message="No calls logged yet" />}
            </div>

            {/* Recent WhatsApp messages */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <SectionHeader title="Recent Messages" viewHref="/inbox" />
              {isLoading ? (
                <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
              ) : data && data.recentMessages.length > 0 ? (
                <ul className="divide-y divide-slate-100 -mx-1">
                  {data.recentMessages.map((m) => (
                    <li key={m.candidateId} className="py-3 px-1 first:pt-0 last:pb-0">
                      <Link href={`/inbox/${m.candidateId}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
                          {m.candidateName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-semibold text-slate-800 truncate">{m.candidateName}</span>
                            <span className="text-[11px] text-slate-400 flex-shrink-0">{formatDateTime(m.lastMessageAt)}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {m.lastDirection === 'OUTBOUND' && <span className="text-indigo-400 font-bold mr-1">→</span>}
                            {m.lastMessage}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <Empty message="No messages yet" />}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Recent candidates ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <SectionHeader title="Recently Added Candidates" viewHref="/candidates" />
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : data && data.recentCandidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {data.recentCandidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/candidates/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                    {c.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 truncate transition-colors">{c.fullName}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{c.phoneNumber}</p>
                    <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <Empty message="No candidates yet" />}
        </div>

      </div>
    </div>
  );
}

