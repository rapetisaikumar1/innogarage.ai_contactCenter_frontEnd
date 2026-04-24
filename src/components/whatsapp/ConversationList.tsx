'use client';

import { ConversationSummary } from '@/hooks/useWhatsApp';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  conversations: ConversationSummary[];
  activeCandidateId?: string;
  onSelect?: (candidateId: string) => void;
}

export default function ConversationList({ conversations, activeCandidateId, onSelect }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6 py-12">
        <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
        </svg>
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const isActive = c.candidateId === activeCandidateId;
        return (
          <li key={c.candidateId}>
            <button
              type="button"
              onClick={() => onSelect?.(c.candidateId)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-slate-100 border-l-2 border-slate-900' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                {c.candidateName.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{c.candidateName}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.lastMessageAt)}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {c.lastDirection === 'OUTBOUND' && (
                    <svg className="w-3 h-3 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                  <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                </div>
                {c.whatsappNumber && (
                  <p className="text-xs text-gray-400 mt-0.5">{c.whatsappNumber}</p>
                )}
              </div>

              {/* Unread badge */}
              {c.unreadCount > 0 && (
                <span className="flex-shrink-0 bg-slate-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {c.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
