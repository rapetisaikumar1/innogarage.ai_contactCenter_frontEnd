'use client';

import Link from 'next/link';
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { STATUS_LABELS, STATUS_COLORS, formatDateTime } from '@/utils/formatters';
import { formatDuration } from '@/hooks/useCalls';

// ─── Shared primitives ────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-6 border-b border-slate-200 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{children}</h2>
      {action}
    </div>
  );
}

function StatCard({
  label, value, sub, icon, iconBg, href,
}: {
  label: string; value: number | string; sub?: string; icon: React.ReactNode; iconBg: string; href?: string;
}) {
  const inner = (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start justify-between gap-3 ${href ? 'hover:border-indigo-200 hover:shadow-md transition-all duration-200' : ''}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  const refreshBtn = (
    <button
      onClick={refetch}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
      title="Refresh"
    >
      <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </button>
  );

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Real-time overview of your contact center" action={refreshBtn} />

      <div className="p-8 space-y-8">

        {/* Stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Candidates" value={data.totalCandidates} href="/candidates"
              sub="All time"
              iconBg="bg-indigo-50"
              icon={<svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard label="Today's Follow-ups" value={data.todayFollowUps} href="/follow-ups"
              sub="Due today"
              iconBg="bg-sky-50"
              icon={<svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard label="Overdue" value={data.overdueFollowUps} href="/follow-ups"
              sub="Needs attention"
              iconBg="bg-amber-50"
              icon={<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard label="Calls Today" value={data.totalCallsToday} href="/calls"
              sub="Logged today"
              iconBg="bg-emerald-50"
              icon={<svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
            />
            <StatCard label="Messages Today" value={data.totalMessagesToday} href="/inbox"
              sub="WhatsApp"
              iconBg="bg-green-50"
              icon={<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" /></svg>}
            />
            <StatCard
              label="Active Pipeline"
              value={data.candidatesByStatus.filter(s => !['CLOSED_WON', 'CLOSED_LOST'].includes(s.status)).reduce((a, b) => a + b.count, 0)}
              sub="Excl. closed"
              iconBg="bg-purple-50"
              icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
            />
          </div>
        ) : null}

        {/* Row 2: Status breakdown + Recent messages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <SectionTitle action={<Link href="/candidates" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all →</Link>}>
              Candidates by Status
            </SectionTitle>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : data && data.candidatesByStatus.length > 0 ? (
              <div className="space-y-3">
                {data.candidatesByStatus.map((s) => {
                  const pct = data.totalCandidates > 0 ? Math.round((s.count / data.totalCandidates) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{s.count} <span className="text-xs font-normal text-slate-400">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-slate-400 py-4 text-center">No candidates yet.</p>}
          </Card>

          <Card className="p-6">
            <SectionTitle action={<Link href="/inbox" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all →</Link>}>
              Recent WhatsApp Messages
            </SectionTitle>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : data && data.recentMessages.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.recentMessages.map((m) => (
                  <li key={m.candidateId} className="py-3 first:pt-0">
                    <Link href={`/inbox/${m.candidateId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
                        {m.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800 truncate">{m.candidateName}</span>
                          <span className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(m.lastMessageAt)}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {m.lastDirection === 'OUTBOUND' && <span className="text-indigo-400 mr-1">→</span>}
                          {m.lastMessage}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-400 py-4 text-center">No messages yet.</p>}
          </Card>
        </div>

        {/* Row 3: Recent calls + Recent candidates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <SectionTitle action={<Link href="/calls" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all →</Link>}>
              Recent Calls
            </SectionTitle>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : data && data.recentCalls.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.recentCalls.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${c.direction === 'OUTBOUND' ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                      <svg className={`w-4 h-4 ${c.direction === 'OUTBOUND' ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/candidates/${c.candidate.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 truncate block transition-colors">
                        {c.candidate.fullName}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {c.direction.charAt(0) + c.direction.slice(1).toLowerCase()} · {c.status.replace('_', ' ').toLowerCase()} · {formatDuration(c.duration)}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">{formatDateTime(c.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-400 py-4 text-center">No calls logged yet.</p>}
          </Card>

          <Card className="p-6">
            <SectionTitle action={<Link href="/candidates" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all →</Link>}>
              Recently Added Candidates
            </SectionTitle>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : data && data.recentCandidates.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.recentCandidates.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                      {c.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/candidates/${c.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 truncate block transition-colors">
                        {c.fullName}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">{c.phoneNumber}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-400 py-4 text-center">No candidates yet.</p>}
          </Card>
        </div>

      </div>
    </div>
  );
}
