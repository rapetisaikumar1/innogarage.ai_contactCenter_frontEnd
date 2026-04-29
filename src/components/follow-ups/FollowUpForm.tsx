'use client';

import { useState } from 'react';
import { createFollowUp } from '@/hooks/useFollowUps';

interface Props {
  candidateId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function buildLocalDateTimeMin(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function FollowUpForm({ candidateId, onSuccess, onCancel }: Props) {
  const [dueAt, setDueAt] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowLocal] = useState(buildLocalDateTimeMin);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dueAt) {
      setError('Please select a date and time.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Convert local datetime-local value to ISO string
      const isoDate = new Date(dueAt).toISOString();
      await createFollowUp(candidateId, { dueAt: isoDate, remarks: remarks.trim() || undefined });
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to schedule follow-up');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date &amp; Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={dueAt}
          min={nowLocal}
          onChange={(e) => setDueAt(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          placeholder="Optional notes about this follow-up..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Scheduling...' : 'Schedule Follow-up'}
        </button>
      </div>
    </form>
  );
}
