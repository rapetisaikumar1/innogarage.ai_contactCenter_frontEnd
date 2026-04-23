'use client';

import { useState } from 'react';
import { useCallsByCandidate } from '@/hooks/useCalls';
import CallCard from './CallCard';
import LogCallForm from './LogCallForm';

interface Props {
  candidateId: string;
  phoneNumber: string;
}

export default function CallsList({ candidateId, phoneNumber }: Props) {
  const { calls, isLoading, error, refetch } = useCallsByCandidate(candidateId);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{calls.length} call{calls.length !== 1 ? 's' : ''} logged</span>
        <button
          onClick={() => setShowForm(true)}
          className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black"
        >
          + Log Call
        </button>
      </div>

      {error && <p className="text-sm text-gray-500 mb-3">{error}</p>}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : calls.length === 0 ? (
        <p className="text-sm text-gray-400">No calls logged yet.</p>
      ) : (
        <div>
          {calls.map((call) => (
            <CallCard key={call.id} call={call} onDeleted={refetch} />
          ))}
        </div>
      )}

      {/* Log call modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Log a Call</h2>
            <LogCallForm
              candidateId={candidateId}
              phoneNumber={phoneNumber}
              onSuccess={() => { setShowForm(false); refetch(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
