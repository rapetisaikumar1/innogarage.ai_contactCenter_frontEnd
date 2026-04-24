'use client';

import { useInbox } from '@/hooks/useWhatsApp';
import ConversationList from '@/components/whatsapp/ConversationList';

export default function InboxPage() {
  const { inbox, isLoading, error, refetch } = useInbox();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list sidebar */}
      <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-slate-900">WhatsApp Inbox</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLoading ? 'Loading…' : `${inbox.length} conversation${inbox.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            title="Refresh conversations"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* WhatsApp badge */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            WhatsApp Business
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
          ) : (
            <ConversationList conversations={inbox} />
          )}
        </div>
      </aside>

      {/* Empty state / message area */}
      <main className="flex-1 flex items-center justify-center bg-slate-50 overflow-hidden">
        <div className="text-center text-slate-400">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">Select a conversation</p>
          <p className="text-xs text-slate-400 mt-1">Choose a chat from the list to view messages</p>
        </div>
      </main>
    </div>
  );
}


