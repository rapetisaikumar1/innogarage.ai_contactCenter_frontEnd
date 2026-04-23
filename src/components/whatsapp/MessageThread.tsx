'use client';

import { Message } from '@/hooks/useWhatsApp';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  messages: Message[];
  currentUserId?: string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageThread({ messages, bottomRef }: Props) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No messages yet. Send the first message.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {messages.map((msg) => {
        const isOutbound = msg.direction === 'OUTBOUND';
        return (
          <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${isOutbound ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isOutbound
                    ? 'bg-gray-500 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.messageText}
              </div>
              <div className={`flex items-center gap-1.5 ${isOutbound ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                {isOutbound && msg.sentBy && (
                  <span className="text-xs text-gray-400">· {msg.sentBy.name}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
