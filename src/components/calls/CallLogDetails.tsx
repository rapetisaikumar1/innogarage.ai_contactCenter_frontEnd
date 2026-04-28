'use client';

import { Call } from '@/hooks/useCalls';
import { formatDateTime } from '@/utils/formatters';

const EVENT_STYLES: Record<Call['events'][number]['type'], string> = {
  SYSTEM: 'bg-slate-100 text-slate-700 border-slate-200',
  ROUTING: 'bg-amber-50 text-amber-700 border-amber-200',
  AGENT: 'bg-sky-50 text-sky-700 border-sky-200',
  RESULT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm text-slate-700">{value}</p>
    </div>
  );
}

export default function CallLogDetails({ call }: { call: Call }) {
  const voiceDetails = call.voiceDetails;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Call ID" value={call.id} />
        <DetailItem label="Provider SID" value={call.providerCallId ?? '—'} />
        <DetailItem label="Voice Session ID" value={call.voiceSessionId ?? '—'} />
        <DetailItem label="Owner Agent" value={call.ownerAgentName ?? '—'} />
        {voiceDetails && (
          <>
            <DetailItem label="Session Status" value={voiceDetails.sessionStatus.replace('_', ' ')} />
            <DetailItem label="Root Call SID" value={voiceDetails.rootCallSid} />
            <DetailItem label="Bridged Call SID" value={voiceDetails.bridgedCallSid ?? '—'} />
            <DetailItem label="End Reason" value={voiceDetails.rawEndReason ?? '—'} />
            <DetailItem label="Reserved Agent" value={voiceDetails.reservedAgentName ?? '—'} />
            <DetailItem label="Assigned Agent" value={voiceDetails.assignedAgentName ?? '—'} />
            <DetailItem label="Unknown Caller" value={voiceDetails.isUnknownCaller ? 'Yes' : 'No'} />
            <DetailItem label="Answered At" value={voiceDetails.answeredAt ? formatDateTime(voiceDetails.answeredAt) : '—'} />
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Event Timeline</h4>
            <p className="text-xs text-slate-500">Every stored voice transition for this call is shown here.</p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 border border-slate-200">
            {call.events.length} event{call.events.length === 1 ? '' : 's'}
          </span>
        </div>

        <ol className="mt-4 space-y-3">
          {call.events.map((event, index) => (
            <li key={`${call.id}-${event.title}-${event.occurredAt}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-400" />
                {index !== call.events.length - 1 && <span className="mt-1 h-full w-px bg-slate-200" />}
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${EVENT_STYLES[event.type]}`}>
                    {event.type}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <span className="ml-auto text-xs text-slate-400">{formatDateTime(event.occurredAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{event.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}