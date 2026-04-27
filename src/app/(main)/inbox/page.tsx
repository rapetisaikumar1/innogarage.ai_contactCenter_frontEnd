'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useInbox, useThread, sendWhatsAppMessage, assignConversationToSelf, ConversationSummary } from '@/hooks/useWhatsApp';
import { useSocket } from '@/hooks/useSocket';
import { useSoftphone } from '@/hooks/useSoftphone';
import { getPendingTransferRequest, respondToTransferRequest, TransferRequest } from '@/hooks/useCandidates';
import ConversationList from '@/components/whatsapp/ConversationList';
import MessageThread from '@/components/whatsapp/MessageThread';
import MessageInput from '@/components/whatsapp/MessageInput';
import ReassignModal from '@/components/whatsapp/ReassignModal';
import TransferModal from '@/components/whatsapp/TransferModal';

type TabKey = 'unassigned' | 'mine' | 'closed' | 'all' | 'assigned';

export default function InboxPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [tab, setTab] = useState<TabKey>(isAdmin ? 'all' : 'unassigned');

  // Map tab to status filter sent to backend
  const statusFilter = tab === 'all' || tab === 'mine' ? undefined : tab.toUpperCase();
  const { inbox, setInbox, isLoading, error, refetch } = useInbox(statusFilter);

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<TransferRequest | null>(null);
  const [respondingTransfer, setRespondingTransfer] = useState(false);

  const softphone = useSoftphone();

  async function handleCallCandidate() {
    const number = conversation?.whatsappNumber;
    if (!number) return;
    if (softphone.status !== 'ready') return;
    setCalling(true);
    try {
      await softphone.startCall(number, { candidateId: conversation?.candidateId });
    } finally {
      setCalling(false);
    }
  }

  const { data: threadData, isLoading: threadLoading, error: threadError, refetch: refetchThread, bottomRef } = useThread(selectedId ?? '');

  // ── Filter list: for 'unassigned' tab also hide any item that got assigned locally ─
  const filteredConversations = inbox.filter((c) => {
    if (tab === 'unassigned' && c.status !== 'UNASSIGNED') return false;
    if (tab === 'mine' && (c.assignedAgentId !== user?.id || c.status !== 'ASSIGNED')) return false;
    if (tab === 'assigned' && c.status !== 'ASSIGNED') return false;
    if (tab === 'closed' && c.status !== 'CLOSED') return false;
    if (search && !c.candidateName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const conversation = inbox.find((c) => c.candidateId === selectedId);

  // ── Load pending transfer whenever selected conversation changes ──────────
  useEffect(() => {
    if (!selectedId) { setPendingTransfer(null); return; }
    getPendingTransferRequest(selectedId).then(setPendingTransfer).catch(() => setPendingTransfer(null));
  }, [selectedId]);

  async function handleRespondTransfer(action: 'accept' | 'reject') {
    if (!pendingTransfer || !selectedId) return;
    setRespondingTransfer(true);
    try {
      await respondToTransferRequest(selectedId, pendingTransfer.id, action);
      setPendingTransfer(null);
      refetch();
    } catch {
      // ignore
    } finally {
      setRespondingTransfer(false);
    }
  }

  // ── Select a conversation (no badge clearing — only clears on agent reply) ─
  function handleSelect(candidateId: string) {
    setSelectedId(candidateId);
  }

  // ── Socket: live inbox updates ────────────────────────────────────────────
  const handleConversationOwnershipChange = useCallback((data: unknown) => {
    const payload = data as Partial<ConversationSummary> & { conversationId?: string };
    if (!payload.conversationId) return;
    setInbox((prev) =>
      prev.map((c) =>
        c.conversationId === payload.conversationId ? { ...c, ...payload } : c
      )
    );
    refetch();
  }, [setInbox, refetch]);

  const handleRemovedFromInbox = useCallback(
    (data: unknown) => {
      const payload = data as { conversationId: string };
      if (!isAdmin) {
        setInbox((prev) => prev.filter((c) => c.conversationId !== payload.conversationId));
      } else {
        refetch();
      }
    },
    [isAdmin, setInbox, refetch]
  );

  useSocket({
    'conversation:updated': handleConversationOwnershipChange,
    'conversation:assigned': handleConversationOwnershipChange,
    'whatsapp:new_unassigned_message': (_data) => {
      // Bump unread count on the conversation item if it's not currently open
      const payload = _data as { conversationId?: string };
      const openConvId = inbox.find(c => c.candidateId === selectedId)?.conversationId;
      if (payload.conversationId && payload.conversationId !== openConvId) {
        setInbox((prev) =>
          prev.map((c) =>
            c.conversationId === payload.conversationId
              ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
              : c
          )
        );
      }
      refetch();
    },
    'conversation:removed_from_inbox': handleRemovedFromInbox,
    'conversation:message_received': (_data) => {
      const payload = _data as { conversationId?: string; direction?: string };
      if (selectedId) refetchThread();
      // Only increment badge for INBOUND messages
      if (payload.conversationId && payload.direction === 'INBOUND') {
        setInbox((prev) =>
          prev.map((c) =>
            c.conversationId === payload.conversationId
              ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
              : c
          )
        );
      }
    },
    // Emitted by backend when agent sends a reply — zero out badges in real-time
    'notifications:cleared': (_data) => {
      const payload = _data as { conversationId?: string };
      if (payload.conversationId) {
        setInbox((prev) =>
          prev.map((c) =>
            c.conversationId === payload.conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    },
  });

  async function handleSend(text: string) {
    if (!selectedId) return;
    await sendWhatsAppMessage(selectedId, text);
    await Promise.all([refetchThread(), refetch()]);
  }

  async function handleAssign(conversationId: string) {
    setAssigning(conversationId);
    try {
      await assignConversationToSelf(conversationId);
      setTab('mine');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Already assigned';
      alert(msg);
    } finally {
      setAssigning(null);
    }
  }

  // ── Tab definitions ───────────────────────────────────────────────────────
  const agentTabs: { key: TabKey; label: string }[] = [
    { key: 'unassigned', label: 'Unassigned' },
    { key: 'mine', label: 'My Conversations' },
    { key: 'closed', label: 'Closed' },
  ];
  const adminTabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unassigned', label: 'Unassigned' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'closed', label: 'Closed' },
  ];
  const tabs = isAdmin ? adminTabs : agentTabs;

  const isConversationAssignable =
    conversation?.status === 'UNASSIGNED' && !isAdmin;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Conversation list sidebar ─────────────────────────────────── */}
      <aside className="w-96 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <h1 className="text-base font-bold text-slate-900">Chats</h1>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-slate-100 flex-shrink-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelectedId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 self-center whitespace-nowrap">
            {isLoading ? '…' : `${filteredConversations.length}`}
          </span>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border-0 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="p-5 text-sm text-red-500">{error}</div>
          ) : isLoading && inbox.length === 0 ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 bg-slate-100 rounded-lg" />
                    <div className="h-3 w-40 bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <p className="text-sm font-medium text-slate-500">No chats found</p>
              {search && <p className="text-xs text-slate-400 mt-1">Try a different search term</p>}
            </div>
          ) : (
            <ConversationList
              conversations={filteredConversations}
              activeCandidateId={selectedId ?? undefined}
              onSelect={handleSelect}
              onAssign={handleAssign}
              assigningId={assigning}
              currentUserId={user?.id}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </aside>

      {/* ── Conversation pane ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden">
        {!selectedId ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center mx-auto mb-5">
                <svg className="w-11 h-11 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-600">Select a conversation</p>
              <p className="text-sm text-slate-400 mt-1.5">Choose a chat from the list to view messages</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 bg-white flex-shrink-0">
              {threadLoading && !conversation ? (
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {(conversation?.candidateName ?? threadData?.messages[0]?.candidate.fullName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {conversation?.candidateName ?? threadData?.messages[0]?.candidate.fullName ?? 'Candidate'}
                      </p>
                      {/* Status badges */}
                      {conversation?.isHighPriority && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wide flex-shrink-0">
                          High Priority
                        </span>
                      )}
                      {conversation?.status === 'UNASSIGNED' && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wide flex-shrink-0">
                          Unassigned
                        </span>
                      )}
                      {conversation?.status === 'ASSIGNED' && conversation.assignedAgentName && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full flex-shrink-0">
                          {conversation.assignedAgentName}
                        </span>
                      )}
                      {conversation?.status === 'CLOSED' && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wide flex-shrink-0">
                          Closed
                        </span>
                      )}
                    </div>
                    {conversation?.whatsappNumber && (
                      <p className="text-xs text-slate-500">{conversation.whatsappNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Assign to me button — agents only on unassigned */}
                    {isConversationAssignable && conversation && (
                      <button
                        onClick={() => handleAssign(conversation.conversationId)}
                        disabled={assigning === conversation.conversationId}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                      >
                        {assigning === conversation.conversationId ? 'Assigning…' : 'Assign to me'}
                      </button>
                    )}
                    {/* Reassign button — admins/managers only on ASSIGNED conversations */}
                    {isAdmin && conversation?.status === 'ASSIGNED' && (
                      <button
                        onClick={() => setReassignOpen(true)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Reassign
                      </button>
                    )}
                    {/* Transfer controls — agents only on their own assigned conversations */}
                    {!isAdmin && conversation?.status === 'ASSIGNED' && conversation.assignedAgentId === user?.id && !pendingTransfer && (
                      <button
                        onClick={() => setTransferOpen(true)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Transfer
                      </button>
                    )}
                    {/* Transfer Requested — faded, unclickable, shows target agent on hover */}
                    {!isAdmin && pendingTransfer && pendingTransfer.fromAgentId === user?.id && (
                      <span
                        title={`Transfer requested to ${pendingTransfer.toAgent.name}`}
                        className="px-3 py-1.5 text-xs font-semibold bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed opacity-60 select-none"
                      >
                        Transfer Requested
                      </span>
                    )}
                    {/* Accept / Reject — shown to the target agent */}
                    {!isAdmin && pendingTransfer && pendingTransfer.toAgentId === user?.id && (
                      <>
                        <button
                          onClick={() => handleRespondTransfer('accept')}
                          disabled={respondingTransfer}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          Accept Transfer
                        </button>
                        <button
                          onClick={() => handleRespondTransfer('reject')}
                          disabled={respondingTransfer}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {/* Call icon button — green, visible when candidate has a number */}
                    {conversation?.whatsappNumber && (
                      <button
                        onClick={handleCallCandidate}
                        disabled={calling || softphone.status !== 'ready'}
                        title={softphone.status !== 'ready' ? 'Softphone not ready' : `Call ${conversation.whatsappNumber}`}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
                        </svg>
                      </button>
                    )}
                    <Link
                      href={`/candidates/${selectedId}`}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      View profile →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {threadError ? (
                <div className="flex items-center justify-center h-full text-red-500 text-sm">{threadError}</div>
              ) : threadLoading ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading messages…</div>
              ) : (
                <MessageThread messages={threadData?.messages ?? []} bottomRef={bottomRef} />
              )}
            </div>

            {/* Input — disabled for agents who aren't assigned */}
            {conversation?.status === 'CLOSED' ? (
              <div className="px-5 py-3 bg-white border-t border-slate-200 text-center text-sm text-slate-400">
                This conversation is closed
              </div>
            ) : !isAdmin && conversation?.status === 'UNASSIGNED' ? (
              <div className="px-5 py-3 bg-white border-t border-slate-200 text-center text-sm text-slate-400">
                Assign this conversation to reply
              </div>
            ) : !isAdmin && conversation?.assignedAgentId !== user?.id ? (
              <div className="px-5 py-3 bg-white border-t border-slate-200 text-center text-sm text-slate-400">
                You are not assigned to this conversation
              </div>
            ) : (
              <MessageInput onSend={handleSend} disabled={threadLoading} />
            )}
          </>
        )}
      </main>

      {/* ── Reassign modal (admin/manager only) ──────────────────────── */}
      {reassignOpen && conversation && conversation.status === 'ASSIGNED' && (
        <ReassignModal
          conversationId={conversation.conversationId}
          candidateName={conversation.candidateName ?? 'Candidate'}
          currentAgentId={conversation.assignedAgentId ?? null}
          onClose={() => setReassignOpen(false)}
          onReassigned={() => refetch()}
        />
      )}
      {transferOpen && conversation && conversation.status === 'ASSIGNED' && selectedId && (
        <TransferModal
          conversationId={conversation.conversationId}
          candidateId={selectedId}
          candidateName={conversation.candidateName ?? 'Candidate'}
          currentAgentId={conversation.assignedAgentId ?? null}
          onClose={() => setTransferOpen(false)}
          onRequestSent={() => {
            setTransferOpen(false);
            getPendingTransferRequest(selectedId).then(setPendingTransfer).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
