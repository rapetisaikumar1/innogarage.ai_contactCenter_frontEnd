'use client';

import React, { useMemo, useState } from 'react';
import { useAgents } from '@/hooks/useAgents';
import { createTransferRequest } from '@/hooks/useCandidates';

interface TransferRequestModalProps {
  candidateId: string;
  candidateName: string;
  /** The id of the agent currently assigned to this candidate (will be excluded from target list) */
  currentAgentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferRequestModal({
  candidateId,
  candidateName,
  currentAgentId,
  onClose,
  onSuccess,
}: TransferRequestModalProps) {
  const { agents, loading: isLoading } = useAgents();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('ALL');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const departments = useMemo(() => {
    const byId = new Map<string, string>();
    agents.forEach((agent) => {
      if (agent.department) byId.set(agent.department.id, agent.department.name);
    });
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((left, right) =>
      left.name.localeCompare(right.name)
    );
  }, [agents]);

  const targetAgents = useMemo(() => {
    return (agents ?? [])
      .filter((a) => a.id !== currentAgentId && a.isActive && a.role === 'AGENT')
      .filter((a) => selectedDepartmentId === 'ALL' || a.departmentId === selectedDepartmentId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [agents, currentAgentId, selectedDepartmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAgentId) return;
    setSubmitting(true);
    setError(null);
    try {
      await createTransferRequest(
        candidateId,
        selectedAgentId,
        selectedDepartmentId === 'ALL' ? undefined : selectedDepartmentId,
      );
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transfer request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-1">Request Transfer</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select an agent to transfer <span className="font-medium">{candidateName}</span> to.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={selectedDepartmentId}
              onChange={(e) => {
                setSelectedDepartmentId(e.target.value);
                setSelectedAgentId('');
              }}
            >
              <option value="ALL">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Mentor</label>
            {isLoading ? (
              <p className="text-sm text-gray-400">Loading mentors…</p>
            ) : targetAgents.length === 0 ? (
              <p className="text-sm text-gray-400">No matching mentors available.</p>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                required
              >
                <option value="">Select mentor</option>
                {targetAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.department?.name ? `(${agent.department.name})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedAgentId}
              className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-900 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
