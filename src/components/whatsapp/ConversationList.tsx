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
  onAssign?: (conversationId: string) => void;
  assigningId?: string | null;
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function ConversationList({
  conversations,
  activeCandidateId,
  onSelect,
  onAssign,
  assigningId,
  currentUserId,
  isAdmin,
}: Props) {
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
        const canAssign = !isAdmin && c.status === 'UNASSIGNED' && onAssign;
        const isAssigningThis = assigningId === c.conversationId;
        const isMine = c.assignedAgentId === currentUserId;

        return (
          <li key={c.candidateId}>
            <button
              type="button"
              onClick={() => onSelect?.(c.candidateId)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-slate-100 border-l-2 border-slate-900' : ''
              }`}
            >
              {/* Avatar with priority indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                  {c.candidateName.charAt(0).toUpperCase()}
                </div>
                {c.isHighPriority && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" title="High Priority" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">{c.candidateName}</span>
                    {c.status === 'UNASSIGNED' && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-bold rounded-full uppercase">
                        New
                      </span>
                    )}
                    {c.status === 'ASSIGNED' && isMine && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-bold rounded-full uppercase">
                        Mine
                      </span>
                    )}
                    {c.status === 'CLOSED' && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-bold rounded-full uppercase">
                        Closed
                      </span>
                    )}
                  </div>
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
                {isAdmin && c.assignedAgentName && (
                  <p className="text-xs text-blue-500 mt-0.5 truncate">→ {c.assignedAgentName}</p>
                )}
              </div>

              {/* Right side: unread badge OR assign button */}
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                {c.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {c.unreadCount}
                  </span>
                )}
                {canAssign && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAssign!(c.conversationId); }}
                    disabled={isAssigningThis}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    {isAssigningThis ? '…' : 'Assign'}
                  </button>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
