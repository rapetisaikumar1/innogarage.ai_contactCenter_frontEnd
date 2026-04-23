'use client';

import Link from 'next/link';
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { STATUS_LABELS, STATUS_COLORS, formatDateTime } from '@/utils/formatters';
import { formatDuration } from '@/hooks/useCalls';

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start justify-between gap-3 ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
      {href && <Link href={href} className="text-xs text-indigo-600 hover:underline font-medium">{linkLabel ?? 'View all →'}</Link>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (error) {
    return (
      <div className="p-8 text-sm text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your contact center activity</p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Key stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Candidates" value={data.totalCandidates} href="/candidates"
            sub="— 0% vs last 7 days"
            iconBg="bg-blue-100"
            icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard label="Today's Follow-ups" value={data.todayFollowUps} href="/follow-ups"
            sub="↓ 50% vs yesterday"
            iconBg="bg-blue-100"
            icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard label="Overdue" value={data.overdueFollowUps} href="/follow-ups"
            sub="— 0% vs last 7 days"
            iconBg="bg-orange-100"
            icon={<svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard label="Calls Today" value={data.totalCallsToday} href="/calls"
            sub="↑ 33% vs yesterday"
            iconBg="bg-green-100"
            icon={<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
          />
          <StatCard label="Messages Today" value={data.totalMessagesToday} href="/inbox"
            sub="↑ 100% vs yesterday"
            iconBg="bg-green-100"
            icon={<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" /></svg>}
          />
          <StatCard
            label="Active Pipeline"
            value={data.candidatesByStatus.filter(s => !['CLOSED_WON','CLOSED_LOST'].includes(s.status)).reduce((a,b) => a + b.count, 0)}
            sub="— 0% vs last 7 days"
            iconBg="bg-purple-100"
            icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
          />
        </div>
      ) : null}

      {/* Status breakdown + recent messages row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Candidates by status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Candidates by Status" href="/candidates" />
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.candidatesByStatus.length > 0 ? (
            <div className="space-y-2">
              {data.candidatesByStatus.map((s) => {
                const pct = data.totalCandidates > 0 ? Math.round((s.count / data.totalCandidates) * 100) : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                      <span className="text-gray-500 font-medium">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No candidates yet.</p>
          )}
        </div>

        {/* Recent WhatsApp messages */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Recent WhatsApp Messages" href="/inbox" />
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.recentMessages.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {data.recentMessages.map((m) => (
                <li key={m.candidateId} className="py-2.5">
                  <Link href={`/inbox/${m.candidateId}`} className="flex items-start gap-3 hover:opacity-80">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold">
                      {m.candidateName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{m.candidateName}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(m.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {m.lastDirection === 'OUTBOUND' && <span className="text-blue-400 mr-1">→</span>}
                        {m.lastMessage}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No messages yet.</p>
          )}
        </div>
      </div>

      {/* Recent calls + recent candidates row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent calls */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Recent Calls" href="/calls" />
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.recentCalls.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {data.recentCalls.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    c.direction === 'OUTBOUND' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-3.5 h-3.5 ${c.direction === 'OUTBOUND' ? 'text-blue-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/candidates/${c.candidate.id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate block">
                      {c.candidate.fullName}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {c.direction.toLowerCase()} · {c.status.replace('_', ' ').toLowerCase()} · {formatDuration(c.duration)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(c.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No calls logged yet.</p>
          )}
        </div>

        {/* Recent candidates */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <SectionHeader title="Recently Added Candidates" href="/candidates" />
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.recentCandidates.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {data.recentCandidates.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                    {c.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/candidates/${c.id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate block">
                      {c.fullName}
                    </Link>
                    <p className="text-xs text-gray-400">{c.phoneNumber}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No candidates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
