'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export type Availability = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  availability: Availability;
  assignedConversationCount: number;
}

export interface AgentCandidate {
  candidateId: string;
  fullName: string;
  whatsappNumber: string | null;
  phoneNumber: string | null;
  status: string;
  conversationStatus: string;
  assignedAt: string | null;
  lastMessageAt: string | null;
}


export function useAgents(enabled = true) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const json = await api.get<{ data?: Agent[]; success?: boolean } | Agent[]>('/agents');
      setAgents((json as { data?: Agent[] }).data ?? (json as Agent[]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, loading, error, refetch: fetchAgents };
}

export function useAgentCandidates(agentId: string | null) {
  const [candidates, setCandidates] = useState<AgentCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) { setCandidates([]); return; }
    setLoading(true);
    setError(null);
    api.get<{ data?: AgentCandidate[] } | AgentCandidate[]>(`/agents/${agentId}/candidates`)
      .then((json) => setCandidates((json as { data?: AgentCandidate[] }).data ?? (json as AgentCandidate[])))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [agentId]);

  return { candidates, loading, error };
}

export async function updateMyAvailability(availability: Availability): Promise<Agent> {
  const json = await api.patch<{ data?: Agent } | Agent>('/agents/availability', { availability });
  return (json as { data?: Agent }).data ?? (json as Agent);
}
