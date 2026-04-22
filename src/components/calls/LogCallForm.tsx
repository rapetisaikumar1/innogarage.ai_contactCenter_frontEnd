'use client';

import { useState } from 'react';
import { logCall, LogCallInput, CallDirection, CallStatus } from '@/hooks/useCalls';

interface Props {
  candidateId: string;
  phoneNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUSES: { value: CallStatus; label: string }[] = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'MISSED', label: 'Missed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
];

export default function LogCallForm({ candidateId, phoneNumber, onSuccess, onCancel }: Props) {
  const [direction, setDirection] = useState<CallDirection>('OUTBOUND');
  const [status, setStatus] = useState<CallStatus>('COMPLETED');
  const [durationMins, setDurationMins] = useState('');
  const [durationSecs, setDurationSecs] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const mins = parseInt(durationMins) || 0;
    const secs = parseInt(durationSecs) || 0;
    const totalSeconds = mins * 60 + secs;

    const input: LogCallInput = {
      candidateId,
      direction,
      phoneNumber,
      status,
      ...(totalSeconds > 0 && { duration: totalSeconds }),
      ...(notes.trim() && { notes: notes.trim() }),
    };

    try {
      await logCall(input);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log call');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {/* Direction */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Direction</label>
        <div className="flex gap-3">
          {(['OUTBOUND', 'INBOUND'] as CallDirection[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                direction === d
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {d === 'OUTBOUND' ? '↗ Outbound' : '↙ Inbound'}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CallStatus)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (optional)</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="0"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500 mt-0.5 block">Minutes</span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="59"
              placeholder="0"
              value={durationSecs}
              onChange={(e) => setDurationSecs(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500 mt-0.5 block">Seconds</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="What was discussed?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {submitting ? 'Saving…' : 'Log Call'}
        </button>
      </div>
    </form>
  );
}
