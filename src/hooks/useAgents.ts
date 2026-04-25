'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

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

function getHeaders() {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/agents`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch agents');
      const json = await res.json();
      setAgents(json.data ?? json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetch(`${API}/api/agents/${agentId}/candidates`, { headers: getHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject('Failed')))
      .then((json) => setCandidates(json.data ?? json))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [agentId]);

  return { candidates, loading, error };
}

export async function updateMyAvailability(availability: Availability): Promise<Agent> {
  const res = await fetch(`${API}/api/agents/availability`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ availability }),
  });
  if (!res.ok) throw new Error('Failed to update availability');
  const json = await res.json();
  return json.data ?? json;
}
