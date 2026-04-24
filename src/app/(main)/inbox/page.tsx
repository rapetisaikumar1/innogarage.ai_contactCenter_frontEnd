'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInbox, useThread, sendWhatsAppMessage } from '@/hooks/useWhatsApp';
import ConversationList from '@/components/whatsapp/ConversationList';
import MessageThread from '@/components/whatsapp/MessageThread';
import MessageInput from '@/components/whatsapp/MessageInput';

export default function InboxPage() {
  const { inbox, isLoading, error, refetch } = useInbox();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: threadData, isLoading: threadLoading, error: threadError, refetch: refetchThread, bottomRef } = useThread(selectedId ?? '');

  const filtered = inbox.filter((c) => {
    if (search && !c.candidateName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'unread' && !c.unreadCount) return false;
    return true;
  });

  const conversation = inbox.find((c) => c.candidateId === selectedId);

  async function handleSend(text: string) {
    if (!selectedId) return;
    await sendWhatsAppMessage(selectedId, text);
    await Promise.all([refetchThread(), refetch()]);
  }

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

        {/* All / Unread filter */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 flex-shrink-0">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            {isLoading ? '…' : `${filtered.length} chat${filtered.length !== 1 ? 's' : ''}`}
          </span>
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <p className="text-sm font-medium text-slate-500">No chats found</p>
              {search && <p className="text-xs text-slate-400 mt-1">Try a different search term</p>}
            </div>
          ) : (
            <ConversationList
              conversations={filtered}
              activeCandidateId={selectedId ?? undefined}
              onSelect={setSelectedId}
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
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {conversation?.candidateName ?? threadData?.messages[0]?.candidate.fullName ?? 'Candidate'}
                    </p>
                    {conversation?.whatsappNumber && (
                      <p className="text-xs text-slate-500">{conversation.whatsappNumber}</p>
                    )}
                  </div>
                  <Link
                    href={`/candidates/${selectedId}`}
                    className="ml-auto text-xs font-medium text-slate-600 hover:text-slate-900 flex-shrink-0 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View profile →
                  </Link>
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

            {/* Input */}
            <MessageInput onSend={handleSend} disabled={threadLoading} />
          </>
        )}
      </main>
    </div>
  );
}
