'use client';

import { useSoftphone } from '@/hooks/useSoftphone';

export default function Softphone() {
  const sp = useSoftphone();
  const displayName = sp.incomingCall?.candidateName || sp.remoteIdentifier || 'Unknown';
  const displayNumber = sp.incomingCall?.phoneNumber || null;

  // Idle state — status is shown in sidebar, no floating pill needed
  if (sp.callState === 'idle') return null;

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
          {displayName}
        </p>
        {displayNumber && <p className="text-xs mt-1 text-blue-100 truncate">{displayNumber}</p>}
        {sp.incomingCall?.isUnknownCaller && sp.callState === 'ringing-incoming' && (
          <span className="inline-flex mt-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-50">
            Unknown caller
          </span>
        )}
      </div>

      <div className="p-4 flex items-center justify-center gap-3">
        {sp.callState === 'ringing-incoming' && (
          <>
            <button
              onClick={sp.acceptIncoming}
              disabled={sp.isClaimingIncoming}
              className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium"
            >
              {sp.isClaimingIncoming ? 'Accepting…' : 'Accept'}
            </button>
            <button
              onClick={sp.rejectIncoming}
              disabled={sp.isClaimingIncoming}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium"
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
