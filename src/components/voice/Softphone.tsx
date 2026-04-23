'use client';

import { useSoftphone } from '@/hooks/useSoftphone';

export default function Softphone() {
  const sp = useSoftphone();

  // Hide widget entirely when idle and ready (no UI clutter)
  if (sp.callState === 'idle' && sp.status === 'ready' && !sp.errorMessage) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white border border-gray-200 shadow-md rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Softphone ready
        </div>
      </div>
    );
  }

  // Initializing / error state pill
  if (sp.callState === 'idle') {
    const dotColor =
      sp.status === 'ready' ? 'bg-green-500' :
      sp.status === 'initializing' ? 'bg-yellow-400 animate-pulse' :
      'bg-red-500';
    const label =
      sp.status === 'ready' ? 'Softphone ready' :
      sp.status === 'initializing' ? 'Connecting softphone…' :
      `Softphone offline${sp.errorMessage ? ` — ${sp.errorMessage}` : ''}`;
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white border border-gray-200 shadow-md rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-gray-600 max-w-xs">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="truncate">{label}</span>
        </div>
      </div>
    );
  }

  // Active call panel
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <p className="text-xs uppercase tracking-wider opacity-80">
          {sp.callState === 'ringing-incoming' && 'Incoming call'}
          {sp.callState === 'connecting' && 'Calling…'}
          {sp.callState === 'in-call' && 'On call'}
          {sp.callState === 'ending' && 'Ending…'}
        </p>
        <p className="text-base font-semibold mt-0.5 truncate">
          {sp.remoteIdentifier || 'Unknown'}
        </p>
      </div>

      <div className="p-4 flex items-center justify-center gap-3">
        {sp.callState === 'ringing-incoming' && (
          <>
            <button
              onClick={sp.acceptIncoming}
              className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
            >
              Accept
            </button>
            <button
              onClick={sp.rejectIncoming}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            >
              Reject
            </button>
          </>
        )}

        {(sp.callState === 'connecting' || sp.callState === 'in-call' || sp.callState === 'ending') && (
          <>
            {sp.callState === 'in-call' && (
              <button
                onClick={sp.toggleMute}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${
                  sp.isMuted
                    ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sp.isMuted ? 'Unmute' : 'Mute'}
              </button>
            )}
            <button
              onClick={sp.hangup}
              disabled={sp.callState === 'ending'}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium"
            >
              Hang up
            </button>
          </>
        )}
      </div>

      {sp.errorMessage && (
        <div className="px-4 pb-3 -mt-2 text-xs text-red-600">{sp.errorMessage}</div>
      )}
    </div>
  );
}
