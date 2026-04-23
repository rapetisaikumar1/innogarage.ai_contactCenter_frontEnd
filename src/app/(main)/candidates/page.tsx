'use client';

import { useState } from 'react';
import { useCandidates } from '@/hooks/useCandidates';
import StatusBadge from '@/components/candidates/StatusBadge';
import CandidateForm from '@/components/candidates/CandidateForm';
import { formatDate } from '@/utils/formatters';
import { CandidateStatus } from '@/types/candidate';
import Link from 'next/link';

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'FOLLOW_UP_REQUIRED', label: 'Follow-up Required' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
  { value: 'CLOSED_LOST', label: 'Closed Lost' },
];

const AVATAR_PALETTES = [
  'bg-gray-900 text-white',
  'bg-gray-100 text-gray-900 ring-1 ring-gray-200',
  'bg-gray-700 text-white',
  'bg-gray-200 text-gray-900',
  'bg-white text-gray-900 ring-1 ring-gray-300',
  'bg-gray-800 text-white',
  'bg-gray-300 text-gray-900',
  'bg-gray-500 text-white',
];

function avatarColors(name: string) {
  return AVATAR_PALETTES[(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % AVATAR_PALETTES.length];
}

export default function CandidatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, error, refetch } = useCandidates({ page, search, status: status || undefined });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(e.target.value);
    setPage(1);
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-6 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `${data.pagination.total} total candidates` : 'Manage and view all candidates'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black shadow-sm shadow-gray-200 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Candidate
        </button>
      </div>

      {/* Add Candidate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-7">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Add New Candidate</h2>
            <CandidateForm
              onSuccess={() => { setShowForm(false); refetch(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="p-8 space-y-5">

        {/* Filters bar */}
        <div className="flex gap-3 items-center flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-64">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, phone, email..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors">
              Search
            </button>
          </form>
          <select
            value={status}
            onChange={handleStatusChange}
            className="border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-36 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-3 w-20 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-gray-500 text-sm">{error}</div>
          ) : !data || data.candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No candidates found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Added</th>
                  <th className="px-6 py-3.5 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.candidates.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColors(c.fullName)}`}>
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/candidates/${c.id}`} className="font-semibold text-gray-800 hover:text-gray-600 transition-colors text-sm">
                            {c.fullName}
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5">#C{String(idx + 1).padStart(3, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{c.phoneNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{c.preferredRole ?? <span className="text-gray-300">—</span>}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status as CandidateStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">
                          {(c.assignments[0]?.user.name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600">{c.assignments[0]?.user.name ?? 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/candidates/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        View
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Showing <span className="font-semibold text-gray-700">{(page - 1) * data.pagination.limit + 1}–{Math.min(page * data.pagination.limit, data.pagination.total)}</span> of <span className="font-semibold text-gray-700">{data.pagination.total}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 bg-white rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
              <button
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 bg-white rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

