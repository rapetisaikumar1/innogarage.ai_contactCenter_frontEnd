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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Candidates</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Candidate
        </button>
      </div>

      {/* Add Candidate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Candidate</h2>
            <CandidateForm
              onSuccess={() => { setShowForm(false); refetch(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700">
            Search
          </button>
        </form>
        <select value={status} onChange={handleStatusChange} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : !data || data.candidates.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No candidates found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${c.id}`} className="font-medium text-blue-600 hover:underline">
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.phoneNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{c.preferredRole ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status as CandidateStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.assignments[0]?.user.name ?? 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(page - 1) * data.pagination.limit + 1}–{Math.min(page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={page === data.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
