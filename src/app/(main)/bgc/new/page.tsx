'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBgcRecord } from '@/hooks/useBgcRecords';
import { BgcDocumentField, BgcFileInput, BgcRecordInput } from '@/types';

const EMPTY_FORM: BgcRecordInput = {
  fullName: '',
  dob: '',
  usEmployerName: '',
  usJobTitle: '',
  usFromDate: '',
  usToDate: '',
  usReference1: '',
  usReference2: '',
  usReference3: '',
  indiaEmployerName: '',
  indiaJobTitle: '',
  indiaFromDate: '',
  indiaToDate: '',
  indiaReference1: '',
  indiaReference2: '',
  indiaReference3: '',
};

const EMPTY_FILES: BgcFileInput = {
  resumeFiles: [],
  usCanadaBgcFiles: [],
  indiaBgcFiles: [],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value || '-'}</p>
    </div>
  );
}

export default function NewBgcRecordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<BgcRecordInput>(EMPTY_FORM);
  const [files, setFiles] = useState<BgcFileInput>(EMPTY_FILES);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">BGC records are admin only</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have permission to create records.</p>
        </div>
      </div>
    );
  }

  function update(field: keyof BgcRecordInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function updateFiles(field: BgcDocumentField, nextFiles: FileList | null) {
    const selectedFiles = Array.from(nextFiles ?? []);

    if (selectedFiles.length > 10) {
      setError('Each document section accepts up to 10 files.');
      return;
    }

    setFiles((current) => ({ ...current, [field]: selectedFiles }));
    setError(null);
  }

  async function handleSave() {
    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createBgcRecord(form, files);
      router.push('/bgc');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save BGC record');
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10';

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <Link href="/bgc" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Back to BGC</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Add BGC Record</h1>
          <p className="mt-1 text-sm text-slate-500">Capture candidate details, employment history, references, and supporting documents.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Personal Details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} className={inputClass} required />
              </Field>
              <Field label="DOB">
                <input type="date" value={form.dob} onChange={(event) => update('dob', event.target.value)} className={inputClass} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">US / Canada Employment</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Employer Name"><input value={form.usEmployerName} onChange={(event) => update('usEmployerName', event.target.value)} className={inputClass} /></Field>
              <Field label="Job Title"><input value={form.usJobTitle} onChange={(event) => update('usJobTitle', event.target.value)} className={inputClass} /></Field>
              <Field label="From Date"><input type="date" value={form.usFromDate} onChange={(event) => update('usFromDate', event.target.value)} className={inputClass} /></Field>
              <Field label="To Date"><input type="date" value={form.usToDate} onChange={(event) => update('usToDate', event.target.value)} className={inputClass} /></Field>
              <Field label="Reference 1 (Name, Email, Title)"><input value={form.usReference1} onChange={(event) => update('usReference1', event.target.value)} className={inputClass} /></Field>
              <Field label="Reference 2 (Name, Email, Title)"><input value={form.usReference2} onChange={(event) => update('usReference2', event.target.value)} className={inputClass} /></Field>
              <Field label="Reference 3 (Name, Email, Title)"><input value={form.usReference3} onChange={(event) => update('usReference3', event.target.value)} className={inputClass} /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Indian Employment</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Employer Name"><input value={form.indiaEmployerName} onChange={(event) => update('indiaEmployerName', event.target.value)} className={inputClass} /></Field>
              <Field label="Job Title"><input value={form.indiaJobTitle} onChange={(event) => update('indiaJobTitle', event.target.value)} className={inputClass} /></Field>
              <Field label="From Date"><input type="date" value={form.indiaFromDate} onChange={(event) => update('indiaFromDate', event.target.value)} className={inputClass} /></Field>
              <Field label="To Date"><input type="date" value={form.indiaToDate} onChange={(event) => update('indiaToDate', event.target.value)} className={inputClass} /></Field>
              <Field label="Reference 1 (Name, Email, Title)"><input value={form.indiaReference1} onChange={(event) => update('indiaReference1', event.target.value)} className={inputClass} /></Field>
              <Field label="Reference 2 (Name, Email, Title)"><input value={form.indiaReference2} onChange={(event) => update('indiaReference2', event.target.value)} className={inputClass} /></Field>
              <Field label="Reference 3 (Name, Email, Title)"><input value={form.indiaReference3} onChange={(event) => update('indiaReference3', event.target.value)} className={inputClass} /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Additional Documents</h2>
            <p className="mt-1 text-sm text-slate-500">Each document section accepts up to 10 files.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {([
                ['resumeFiles', 'Resume Used'],
                ['usCanadaBgcFiles', 'US/Canada BGC Documents'],
                ['indiaBgcFiles', 'Indian BGC Documents'],
              ] as Array<[BgcDocumentField, string]>).map(([field, label]) => (
                <div key={field} className="rounded-2xl border border-slate-200 p-4">
                  <label className="block text-sm font-semibold text-slate-700">{label}</label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(event) => updateFiles(field, event.target.files)}
                    className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <p className="mt-2 text-xs text-slate-400">{files[field].length}/10 files selected</p>
                  {files[field].length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-slate-500">
                      {files[field].map((file) => <li key={`${field}-${file.name}`}>{file.name}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowPreview(true)} className="rounded-xl border border-black bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-slate-50">
              Preview
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <h2 className="text-base font-bold text-slate-950">Preview</h2>
          {showPreview ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3">
                <PreviewRow label="Full Name" value={form.fullName} />
                <PreviewRow label="DOB" value={form.dob} />
                <PreviewRow label="US / Canada Employer" value={form.usEmployerName} />
                <PreviewRow label="US / Canada Job Title" value={form.usJobTitle} />
                <PreviewRow label="US / Canada Duration" value={`${form.usFromDate || '-'} to ${form.usToDate || '-'}`} />
                <PreviewRow label="US / Canada Reference 1" value={form.usReference1} />
                <PreviewRow label="US / Canada Reference 2" value={form.usReference2} />
                <PreviewRow label="US / Canada Reference 3" value={form.usReference3} />
                <PreviewRow label="Indian Employer" value={form.indiaEmployerName} />
                <PreviewRow label="Indian Job Title" value={form.indiaJobTitle} />
                <PreviewRow label="Indian Duration" value={`${form.indiaFromDate || '-'} to ${form.indiaToDate || '-'}`} />
                <PreviewRow label="Indian Reference 1" value={form.indiaReference1} />
                <PreviewRow label="Indian Reference 2" value={form.indiaReference2} />
                <PreviewRow label="Indian Reference 3" value={form.indiaReference3} />
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Documents</p>
                <p className="mt-2">Resume Used: {files.resumeFiles.length} files</p>
                <p>US/Canada BGC Documents: {files.usCanadaBgcFiles.length} files</p>
                <p>Indian BGC Documents: {files.indiaBgcFiles.length} files</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">Click Preview to review the entered information before saving the record.</p>
          )}
        </aside>
      </div>
    </div>
  );
}