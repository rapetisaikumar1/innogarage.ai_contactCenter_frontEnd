import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface Message {
  id: string;
  candidateId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  channel: string;
  messageText: string;
  externalMessageId: string | null;
  sentByUserId: string | null;
  createdAt: string;
  candidate: { id: string; fullName: string; phoneNumber: string | null; whatsappNumber: string | null };
  sentBy: { id: string; name: string } | null;
}

export interface ConversationSummary {
  candidateId: string;
  candidateName: string;
  whatsappNumber: string | null;
  lastMessage: string;
  lastMessageAt: string;
  lastDirection: 'INBOUND' | 'OUTBOUND';
  unreadCount: number;
}

interface ThreadResponse {
  messages: Message[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Inbox hook ───────────────────────────────────────────────────────────────
export function useInbox() {
  const [inbox, setInbox] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInbox = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<ConversationSummary[]>>('/whatsapp/inbox');
      setInbox(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  return { inbox, isLoading, error, refetch: fetchInbox };
}

// ─── Thread hook (auto-scrolls to bottom on new messages) ────────────────────
export function useThread(candidateId: string) {
  const [data, setData] = useState<ThreadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchThread = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<ApiResponse<ThreadResponse>>(
        `/whatsapp/candidates/${candidateId}/messages?page=1&limit=100`
      );
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  // Scroll to bottom after messages load
  useEffect(() => {
    if (data && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);

  return { data, isLoading, error, refetch: fetchThread, bottomRef };
}

// ─── Send message helper ──────────────────────────────────────────────────────
export async function sendWhatsAppMessage(
  candidateId: string,
  message: string
): Promise<Message> {
  const res = await api.post<ApiResponse<Message>>('/whatsapp/send', { candidateId, message });
  return res.data;
}
