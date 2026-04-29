'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBgcRecord } from '@/hooks/useBgcRecords';
import { BGC_DOCUMENT_LABELS } from '@/lib/bgcDraft';
import { getBgcDocumentViewerHref } from '@/lib/bgcDocumentViewer';

function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function DocRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-b border-slate-200 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="text-sm text-slate-900">{value || '-'}</p>
    </div>
  );
}

export default function SavedBgcRecordPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const recordId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;
  const canAccessBgc = user?.role === 'ADMIN' || Boolean(user?.canAccessBgc);
  const { data, isLoading, error } = useBgcRecord(recordId, canAccessBgc && Boolean(recordId));

  if (!canAccessBgc) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">BGC access is restricted</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have permission to preview records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-5">
        <div>
          <Link href="/bgc" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Back to BGC</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">BGC Record Preview</h1>
          <p className="mt-1 text-sm text-slate-500">View the full saved BGC record and open documents in a new tab.</p>
        </div>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {isLoading ? (
        <div className="mx-auto max-w-4xl space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : !data ? (
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">BGC record not found</h2>
          <p className="mt-2 text-sm text-slate-500">The selected BGC record could not be loaded.</p>
        </div>
      ) : (
        <article className="mx-auto max-w-4xl rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="border-b border-slate-200 pb-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Background Check Document</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-950">{data.fullName}</h2>
                <p className="mt-1 text-sm text-slate-500">Created on {formatDate(data.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Record Summary</p>
                <p className="mt-1">Created by {data.createdBy.name || 'Admin'}.</p>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="text-lg font-bold text-slate-950">Personal Details</h3>
            <div className="mt-3">
              <DocRow label="Full Name" value={data.fullName} />
              <DocRow label="DOB" value={formatDate(data.dob)} />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-lg font-bold text-slate-950">US / Canada Employment</h3>
            <div className="mt-3">
              <DocRow label="Employer Name" value={data.usEmployerName || '-'} />
              <DocRow label="Job Title" value={data.usJobTitle || '-'} />
              <DocRow label="From Date" value={formatDate(data.usFromDate)} />
              <DocRow label="To Date" value={formatDate(data.usToDate)} />
              <DocRow label="Reference 1" value={data.usReference1 || 'Not provided'} />
              <DocRow label="Reference 2" value={data.usReference2 || 'Not provided'} />
              <DocRow label="Reference 3" value={data.usReference3 || 'Not provided'} />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-lg font-bold text-slate-950">Indian Employment</h3>
            <div className="mt-3">
              <DocRow label="Employer Name" value={data.indiaEmployerName || '-'} />
              <DocRow label="Job Title" value={data.indiaJobTitle || '-'} />
              <DocRow label="From Date" value={formatDate(data.indiaFromDate)} />
              <DocRow label="To Date" value={formatDate(data.indiaToDate)} />
              <DocRow label="Reference 1" value={data.indiaReference1 || 'Not provided'} />
              <DocRow label="Reference 2" value={data.indiaReference2 || 'Not provided'} />
              <DocRow label="Reference 3" value={data.indiaReference3 || 'Not provided'} />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-lg font-bold text-slate-950">Supporting Documents</h3>
            <div className="mt-4 space-y-4">
              {(Object.entries(BGC_DOCUMENT_LABELS) as Array<[keyof typeof BGC_DOCUMENT_LABELS, string]>).map(([field, label]) => (
                <div key={field} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      {data[field].length} file{data[field].length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {data[field].map((document) => (
                      <li key={`${field}-${document.publicId}`}>
                        <a href={getBgcDocumentViewerHref(document)} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 underline underline-offset-2 hover:text-slate-950">
                          {document.originalName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </article>
      )}
    </div>
  );
}