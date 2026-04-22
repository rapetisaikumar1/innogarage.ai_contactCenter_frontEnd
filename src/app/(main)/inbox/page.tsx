'use client';

import { useInbox } from '@/hooks/useWhatsApp';
import ConversationList from '@/components/whatsapp/ConversationList';

export default function InboxPage() {
  const { inbox, isLoading, error, refetch } = useInbox();

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
            onClick={refetch}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="p-4 text-sm text-red-500">{error}</div>
          ) : (
            <ConversationList conversations={inbox} />
          )}
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
          </svg>
          <p className="text-sm">Select a conversation to view messages</p>
        </div>
      </main>
    </div>
  );
}
