'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createBgcRecord, updateBgcRecord, useBgcRecord } from '@/hooks/useBgcRecords';
import {
  BGC_DOCUMENT_LABELS,
  BgcDocumentCollections,
  EMPTY_BGC_FORM,
  clearBgcDraft,
  createEmptyBgcDocuments,
  createEmptyBgcFiles,
  getBgcDraft,
  getBgcExistingDocuments,
  saveBgcDraft,
  toBgcFormInput,
  validateBgcDraft,
} from '@/lib/bgcDraft';
import { getBgcDocumentViewerHref } from '@/lib/bgcDocumentViewer';
import { BgcDocumentField, BgcFileInput, BgcRecordInput } from '@/types';

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

interface BgcFormScreenProps {
  mode: 'create' | 'edit';
  recordId: string | null;
  formPath: string;
  title: string;
  initialForm: BgcRecordInput;
  initialFiles: BgcFileInput;
  initialExistingDocuments: BgcDocumentCollections;
}

function BgcFormScreen({
  mode,
  recordId,
  formPath,
  title,
  initialForm,
  initialFiles,
  initialExistingDocuments,
}: BgcFormScreenProps) {
  const router = useRouter();
  const [form, setForm] = useState<BgcRecordInput>(initialForm);
  const [files, setFiles] = useState<BgcFileInput>(initialFiles);
  const [existingDocuments] = useState<BgcDocumentCollections>(initialExistingDocuments);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function update(field: keyof BgcRecordInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors([]);
  }

  function updateFiles(field: BgcDocumentField, nextFiles: FileList | null) {
    const selectedFiles = Array.from(nextFiles ?? []);

    if (selectedFiles.length > 10) {
      setErrors([`${BGC_DOCUMENT_LABELS[field]} accepts up to 10 files.`]);
      return;
    }

    setFiles((current) => ({ ...current, [field]: selectedFiles }));
    setErrors([]);
  }

  function handlePreview() {
    const validationErrors = validateBgcDraft(form, files, existingDocuments);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    saveBgcDraft({
      form,
      files,
      existingDocuments,
      sourcePath: formPath,
      recordId,
    });
    router.push('/bgc/preview');
  }

  async function handleSave() {
    const validationErrors = validateBgcDraft(form, files, existingDocuments);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      if (mode === 'edit' && recordId) {
        await updateBgcRecord(recordId, form, files);
      } else {
        await createBgcRecord(form, files);
      }

      clearBgcDraft();
      router.push('/bgc');
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : `Failed to ${mode === 'edit' ? 'update' : 'save'} BGC record`]);
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
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Capture candidate details, employment history, references, and supporting documents.</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">All fields are required except reference fields.</p>
        </div>
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Personal Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Full Name" required>
              <input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} className={inputClass} required />
            </Field>
            <Field label="DOB" required>
              <input type="date" value={form.dob} onChange={(event) => update('dob', event.target.value)} className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">US / Canada Employment</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Employer Name" required><input value={form.usEmployerName} onChange={(event) => update('usEmployerName', event.target.value)} className={inputClass} /></Field>
            <Field label="Job Title" required><input value={form.usJobTitle} onChange={(event) => update('usJobTitle', event.target.value)} className={inputClass} /></Field>
            <Field label="From Date" required><input type="date" value={form.usFromDate} onChange={(event) => update('usFromDate', event.target.value)} className={inputClass} /></Field>
            <Field label="To Date" required><input type="date" value={form.usToDate} onChange={(event) => update('usToDate', event.target.value)} className={inputClass} /></Field>
            <Field label="Reference 1 (Name, Email, Title)"><input value={form.usReference1} onChange={(event) => update('usReference1', event.target.value)} className={inputClass} /></Field>
            <Field label="Reference 2 (Name, Email, Title)"><input value={form.usReference2} onChange={(event) => update('usReference2', event.target.value)} className={inputClass} /></Field>
            <Field label="Reference 3 (Name, Email, Title)"><input value={form.usReference3} onChange={(event) => update('usReference3', event.target.value)} className={inputClass} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Indian Employment</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Employer Name" required><input value={form.indiaEmployerName} onChange={(event) => update('indiaEmployerName', event.target.value)} className={inputClass} /></Field>
            <Field label="Job Title" required><input value={form.indiaJobTitle} onChange={(event) => update('indiaJobTitle', event.target.value)} className={inputClass} /></Field>
            <Field label="From Date" required><input type="date" value={form.indiaFromDate} onChange={(event) => update('indiaFromDate', event.target.value)} className={inputClass} /></Field>
            <Field label="To Date" required><input type="date" value={form.indiaToDate} onChange={(event) => update('indiaToDate', event.target.value)} className={inputClass} /></Field>
            <Field label="Reference 1 (Name, Email, Title)"><input value={form.indiaReference1} onChange={(event) => update('indiaReference1', event.target.value)} className={inputClass} /></Field>
            <Field label="Reference 2 (Name, Email, Title)"><input value={form.indiaReference2} onChange={(event) => update('indiaReference2', event.target.value)} className={inputClass} /></Field>
            <Field label="Reference 3 (Name, Email, Title)"><input value={form.indiaReference3} onChange={(event) => update('indiaReference3', event.target.value)} className={inputClass} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">Additional Documents</h2>
          <p className="mt-1 text-sm text-slate-500">Each document section is required and accepts up to 10 files.</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {(Object.entries(BGC_DOCUMENT_LABELS) as Array<[BgcDocumentField, string]>).map(([field, label]) => (
              <div key={field} className="rounded-2xl border border-slate-200 p-4">
                <label className="block text-sm font-semibold text-slate-700">
                  {label}
                  <span className="ml-1 text-red-600">*</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => updateFiles(field, event.target.files)}
                  className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {mode === 'edit' && existingDocuments[field].length > 0 && files[field].length === 0 && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current files</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-500">
                      {existingDocuments[field].map((document) => (
                        <li key={`${field}-${document.publicId}`}>
                          <a href={getBgcDocumentViewerHref(document)} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-slate-900">
                            {document.originalName}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-[11px] text-slate-400">Upload new files only if you want to replace the current set.</p>
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">{files[field].length}/10 new files selected</p>
                {files[field].length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-500">
                    {files[field].map((file) => <li key={`${field}-${file.name}`}>{file.name}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {errors.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">Please complete the required fields before preview or save.</p>
            <ul className="mt-2 space-y-1">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
          <button type="button" onClick={handlePreview} className="rounded-xl border border-black bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-slate-50">
            Preview
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            {isSaving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewBgcRecordPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const mode = editId ? 'edit' : 'create';
  const formPath = editId ? `/bgc/new?edit=${editId}` : '/bgc/new';
  const initialDraft = getBgcDraft();
  const shouldUseDraft = Boolean(initialDraft && initialDraft.recordId === (editId ?? null) && initialDraft.sourcePath === formPath);
  const canAccessBgc = user?.role === 'ADMIN' || Boolean(user?.canAccessBgc);
  const { data: editRecord, isLoading, error } = useBgcRecord(editId, canAccessBgc && Boolean(editId) && !shouldUseDraft);

  if (!canAccessBgc) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">BGC access is restricted</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have permission to create records.</p>
        </div>
      </div>
    );
  }

  if (mode === 'edit' && !shouldUseDraft && isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'edit' && !shouldUseDraft && !editRecord) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">BGC record not found</h1>
          <p className="mt-2 text-sm text-slate-500">{error ?? 'The selected BGC record could not be loaded for editing.'}</p>
          <Link href="/bgc" className="mt-5 inline-flex rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Back to BGC
          </Link>
        </div>
      </div>
    );
  }

  const initialForm = shouldUseDraft && initialDraft
    ? initialDraft.form
    : editRecord
      ? toBgcFormInput(editRecord)
      : EMPTY_BGC_FORM;
  const initialFiles = shouldUseDraft && initialDraft
    ? initialDraft.files
    : createEmptyBgcFiles();
  const initialExistingDocuments = shouldUseDraft && initialDraft
    ? initialDraft.existingDocuments
    : editRecord
      ? getBgcExistingDocuments(editRecord)
      : createEmptyBgcDocuments();

  return (
    <BgcFormScreen
      key={formPath}
      mode={mode}
      recordId={editId}
      formPath={formPath}
      title={mode === 'edit' ? 'Edit BGC Record' : 'Add BGC Record'}
      initialForm={initialForm}
      initialFiles={initialFiles}
      initialExistingDocuments={initialExistingDocuments}
    />
  );
}