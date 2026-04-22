'use client';

import { use } from 'react';
import Link from 'next/link';
import { useInbox, useThread, sendWhatsAppMessage } from '@/hooks/useWhatsApp';
import ConversationList from '@/components/whatsapp/ConversationList';
import MessageThread from '@/components/whatsapp/MessageThread';
import MessageInput from '@/components/whatsapp/MessageInput';

interface Props {
  params: Promise<{ candidateId: string }>;
}

export default function ConversationPage({ params }: Props) {
  const { candidateId } = use(params);
  const { inbox, isLoading: inboxLoading, refetch: refetchInbox } = useInbox();
  const { data, isLoading: threadLoading, error, refetch: refetchThread, bottomRef } = useThread(candidateId);

  const conversation = inbox.find((c) => c.candidateId === candidateId);

  async function handleSend(text: string) {
    await sendWhatsAppMessage(candidateId, text);
    await Promise.all([refetchThread(), refetchInbox()]);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div>
            <h1 className="text-base font-semibold text-gray-900">WhatsApp Inbox</h1>
            <p className="text-xs text-gray-500 mt-0.5">{inbox.length} conversation{inbox.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={refetchInbox}
            disabled={inboxLoading}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${inboxLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList conversations={inbox} activeCandidateId={candidateId} />
        </div>
      </aside>

      {/* Conversation pane */}
      <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 bg-white flex-shrink-0">
          {threadLoading && !conversation ? (
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                {(conversation?.candidateName ?? data?.messages[0]?.candidate.fullName ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {conversation?.candidateName ?? data?.messages[0]?.candidate.fullName ?? 'Candidate'}
                </p>
                {conversation?.whatsappNumber && (
                  <p className="text-xs text-gray-500">{conversation.whatsappNumber}</p>
                )}
              </div>
              <Link
                href={`/candidates/${candidateId}`}
                className="ml-auto text-xs text-blue-600 hover:underline flex-shrink-0"
              >
                View profile →
              </Link>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="flex items-center justify-center h-full text-red-500 text-sm">{error}</div>
          ) : threadLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading messages…</div>
          ) : (
            <MessageThread
              messages={data?.messages ?? []}
              bottomRef={bottomRef}
            />
          )}
        </div>

        {/* Input */}
        <MessageInput onSend={handleSend} disabled={threadLoading} />
      </main>
    </div>
  );
}
