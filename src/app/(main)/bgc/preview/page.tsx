'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BGC_DOCUMENT_LABELS, getBgcDraft } from '@/lib/bgcDraft';
import { getBgcDocumentViewerHref, openLocalBgcDocumentViewer } from '@/lib/bgcDocumentViewer';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function DocRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-b border-slate-200 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="text-sm text-slate-900">{value || '-'}</p>
    </div>
  );
}

export default function BgcPreviewPage() {
  const { user } = useAuth();
  const [draft] = useState(() => getBgcDraft());
  const [generatedOn] = useState(() => new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date()));

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">BGC records are admin only</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have permission to preview records.</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">No BGC draft available</h1>
          <p className="mt-2 text-sm text-slate-500">Start from the BGC form to preview the entered data.</p>
          <Link href="/bgc/new" className="mt-5 inline-flex rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Back to form
          </Link>
        </div>
      </div>
    );
  }

  const activeDraft = draft;
  const backHref = activeDraft.sourcePath || '/bgc/new';

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-5">
        <div>
          <Link href={backHref} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Back to form</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">BGC Preview</h1>
          <p className="mt-1 text-sm text-slate-500">Review the record as a document, then return to the form page to save it.</p>
        </div>
      </div>

      <article className="mx-auto max-w-4xl rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Background Check Document</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">{activeDraft.form.fullName}</h2>
              <p className="mt-1 text-sm text-slate-500">Generated on {generatedOn}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Record Summary</p>
              <p className="mt-1">Preview only. Return to the form page to save this record.</p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-lg font-bold text-slate-950">Personal Details</h3>
          <div className="mt-3">
            <DocRow label="Full Name" value={activeDraft.form.fullName} />
            <DocRow label="DOB" value={formatDate(activeDraft.form.dob)} />
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-bold text-slate-950">US / Canada Employment</h3>
          <div className="mt-3">
            <DocRow label="Employer Name" value={activeDraft.form.usEmployerName} />
            <DocRow label="Job Title" value={activeDraft.form.usJobTitle} />
            <DocRow label="From Date" value={formatDate(activeDraft.form.usFromDate)} />
            <DocRow label="To Date" value={formatDate(activeDraft.form.usToDate)} />
            <DocRow label="Reference 1" value={activeDraft.form.usReference1 || 'Not provided'} />
            <DocRow label="Reference 2" value={activeDraft.form.usReference2 || 'Not provided'} />
            <DocRow label="Reference 3" value={activeDraft.form.usReference3 || 'Not provided'} />
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-bold text-slate-950">Indian Employment</h3>
          <div className="mt-3">
            <DocRow label="Employer Name" value={activeDraft.form.indiaEmployerName} />
            <DocRow label="Job Title" value={activeDraft.form.indiaJobTitle} />
            <DocRow label="From Date" value={formatDate(activeDraft.form.indiaFromDate)} />
            <DocRow label="To Date" value={formatDate(activeDraft.form.indiaToDate)} />
            <DocRow label="Reference 1" value={activeDraft.form.indiaReference1 || 'Not provided'} />
            <DocRow label="Reference 2" value={activeDraft.form.indiaReference2 || 'Not provided'} />
            <DocRow label="Reference 3" value={activeDraft.form.indiaReference3 || 'Not provided'} />
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-bold text-slate-950">Supporting Documents</h3>
          <div className="mt-4 space-y-4">
            {(Object.entries(BGC_DOCUMENT_LABELS) as Array<[keyof typeof activeDraft.files, string]>).map(([field, label]) => {
              const selectedFiles = activeDraft.files[field];
              const currentDocuments = activeDraft.existingDocuments[field];
              const totalFiles = selectedFiles.length || currentDocuments.length;

              return (
                <div key={field} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      {totalFiles} file{totalFiles === 1 ? '' : 's'}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {selectedFiles.length > 0
                      ? selectedFiles.map((file) => (
                          <li key={`${field}-${file.name}`}>
                            <button type="button" onClick={() => openLocalBgcDocumentViewer(file)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left font-medium text-slate-700 underline underline-offset-2 hover:text-slate-950">
                              {file.name}
                            </button>
                          </li>
                        ))
                      : currentDocuments.map((document) => (
                          <li key={`${field}-${document.publicId}`}>
                            <a href={getBgcDocumentViewerHref(document)} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 underline underline-offset-2 hover:text-slate-950">
                              {document.originalName}
                            </a>
                          </li>
                        ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );
}