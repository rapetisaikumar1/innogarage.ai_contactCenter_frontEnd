'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBgcRecord } from '@/hooks/useBgcRecords';
import { BGC_DOCUMENT_LABELS, clearBgcDraft, getBgcDraft, saveBgcDraft, validateBgcDraft } from '@/lib/bgcDraft';

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
  const router = useRouter();
  const [draft] = useState(() => getBgcDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function handleSave() {
    const validationErrors = validateBgcDraft(activeDraft.form, activeDraft.files);

    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createBgcRecord(activeDraft.form, activeDraft.files);
      clearBgcDraft();
      router.push('/bgc');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save BGC record');
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit() {
    saveBgcDraft(activeDraft);
    router.push('/bgc/new');
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/bgc/new" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Back to form</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">BGC Preview</h1>
          <p className="mt-1 text-sm text-slate-500">Review the record as a document before saving it.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={handleEdit} className="rounded-xl border border-black bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-slate-50">
            Edit Details
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <article className="mx-auto max-w-4xl rounded-[28px] border border-slate-300 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Background Check Document</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">{draft.form.fullName}</h2>
              <p className="mt-1 text-sm text-slate-500">Generated on {generatedOn}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Record Summary</p>
              <p className="mt-1">Mandatory fields complete and ready to save.</p>
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
            {(Object.entries(BGC_DOCUMENT_LABELS) as Array<[keyof typeof activeDraft.files, string]>).map(([field, label]) => (
              <div key={field} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    {activeDraft.files[field].length} file{activeDraft.files[field].length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {activeDraft.files[field].map((file) => (
                    <li key={`${field}-${file.name}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}