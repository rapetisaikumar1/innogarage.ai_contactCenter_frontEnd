'use client';

import { ReactNode, useDeferredValue, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  createPaymentHistory,
  deletePaymentHistory,
  updatePaymentHistory,
  usePaymentHistories,
} from '@/hooks/usePaymentHistory';
import {
  PaymentHistory,
  PaymentHistoryInput,
  PAYMENT_HISTORY_STATUS_LABELS,
  PAYMENT_HISTORY_STATUS_ORDER,
  PaymentHistoryStatus,
} from '@/types';

type PaymentHistoryFormState = {
  name: string;
  placedCompany: string;
  placedJobTitle: string;
  status: PaymentHistoryStatus;
  notes: string;
};

type PaymentHistoryModalProps = {
  mode: 'create' | 'edit';
  initialValue: PaymentHistoryFormState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (value: PaymentHistoryFormState) => Promise<void>;
};

type DeleteDialogProps = {
  entry: PaymentHistory;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DEFAULT_STATUS: PaymentHistoryStatus = 'PAID_ON_TIME';

const STATUS_BADGE_CLASSES: Record<PaymentHistoryStatus, string> = {
  PAID_ON_TIME: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  ASKED_FOR_EXTENSION: 'border border-amber-200 bg-amber-50 text-amber-700',
  FULLY_PAID: 'border border-green-200 bg-green-50 text-green-700',
  NOT_RESPONDING: 'border border-rose-200 bg-rose-50 text-rose-700',
  ABSCONDED: 'border border-red-200 bg-red-50 text-red-700',
};

const METRIC_STYLES = [
  'from-slate-950 via-slate-900 to-slate-800 text-white',
  'from-emerald-600 via-emerald-500 to-emerald-400 text-white',
  'from-amber-500 via-amber-400 to-yellow-300 text-slate-950',
  'from-rose-600 via-rose-500 to-orange-400 text-white',
] as const;

function PrimaryButton({
  children,
  type = 'button',
  className = '',
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: (typeof METRIC_STYLES)[number];
}) {
  return (
    <div className={`rounded-[24px] bg-gradient-to-br p-[1px] shadow-sm ${tone}`}>
      <div className="h-full rounded-[23px] bg-white/95 px-5 py-4 backdrop-blur-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-bold text-slate-950 tabular-nums">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentHistoryStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[status]}`}>
      {PAYMENT_HISTORY_STATUS_LABELS[status]}
    </span>
  );
}

function PaymentHistoryModal({ mode, initialValue, saving, error, onClose, onSubmit }: PaymentHistoryModalProps) {
  const [form, setForm] = useState<PaymentHistoryFormState>(initialValue);

  function update<K extends keyof PaymentHistoryFormState>(field: K, value: PaymentHistoryFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      name: form.name.trim(),
      placedCompany: form.placedCompany.trim(),
      placedJobTitle: form.placedJobTitle.trim(),
      status: form.status,
      notes: form.notes,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Payment History</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {mode === 'create' ? 'Add payment record' : 'Edit payment record'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep placement payment commitments clear, current, and easy to review.
            </p>
          </div>
          <PrimaryButton className="h-10 w-10 rounded-full px-0" onClick={onClose}>
            <span className="text-lg leading-none">&times;</span>
          </PrimaryButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">Name</label>
              <input
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                maxLength={120}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                placeholder="Enter candidate name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">Placed company</label>
              <input
                value={form.placedCompany}
                onChange={(event) => update('placedCompany', event.target.value)}
                maxLength={120}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">Placed job title</label>
              <input
                value={form.placedJobTitle}
                onChange={(event) => update('placedJobTitle', event.target.value)}
                maxLength={120}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                placeholder="Enter placed job title"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">Status</label>
              <select
                value={form.status}
                onChange={(event) => update('status', event.target.value as PaymentHistoryStatus)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              >
                {PAYMENT_HISTORY_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {PAYMENT_HISTORY_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">Notes</label>
            <textarea
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              maxLength={2000}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              placeholder="Add any payment timeline context, follow-up detail, or risk note"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <PrimaryButton className="sm:min-w-28" onClick={onClose}>
              Cancel
            </PrimaryButton>
            <PrimaryButton type="submit" className="sm:min-w-36" disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create record' : 'Save changes'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDialog({ entry, deleting, error, onClose, onConfirm }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Delete Record</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Delete {entry.name}?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This removes the payment history entry for {entry.placedCompany}. This action cannot be undone.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <PrimaryButton className="sm:min-w-28" onClick={onClose}>
            Cancel
          </PrimaryButton>
          <PrimaryButton className="sm:min-w-32" onClick={() => void onConfirm()} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete record'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[24px] border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6M7.5 4.5h9A2.25 2.25 0 0118.75 6.75v10.5A2.25 2.25 0 0116.5 19.5h-9a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 017.5 4.5z" />
        </svg>
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-950">No payment records yet</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Add the first record to track placement payments, extension requests, and risk signals from one place.
      </p>
      <PrimaryButton className="mt-6" onClick={onCreate}>
        Add first record
      </PrimaryButton>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function previewNotes(value: string | null): string {
  if (!value) return 'No notes added';
  return value.length > 88 ? `${value.slice(0, 88)}...` : value;
}

function toFormState(entry?: PaymentHistory | null): PaymentHistoryFormState {
  return {
    name: entry?.name ?? '',
    placedCompany: entry?.placedCompany ?? '',
    placedJobTitle: entry?.placedJobTitle ?? '',
    status: entry?.status ?? DEFAULT_STATUS,
    notes: entry?.notes ?? '',
  };
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = usePaymentHistories(user?.role === 'ADMIN');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | PaymentHistoryStatus>('ALL');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeEntry, setActiveEntry] = useState<PaymentHistory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentHistory | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const filteredEntries = data.filter((entry) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    const matchesSearch = searchTerm.length === 0 || [
      entry.name,
      entry.placedCompany,
      entry.placedJobTitle,
      entry.notes ?? '',
      PAYMENT_HISTORY_STATUS_LABELS[entry.status],
    ].some((value) => value.toLowerCase().includes(searchTerm));

    const matchesStatus = selectedStatus === 'ALL' || entry.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const metrics = {
    total: data.length,
    settled: data.filter((entry) => entry.status === 'PAID_ON_TIME' || entry.status === 'FULLY_PAID').length,
    extensions: data.filter((entry) => entry.status === 'ASKED_FOR_EXTENSION').length,
    attention: data.filter((entry) => entry.status === 'NOT_RESPONDING' || entry.status === 'ABSCONDED').length,
  };

  function openCreateModal() {
    setActiveEntry(null);
    setSaveError(null);
    setModalMode('create');
  }

  function openEditModal(entry: PaymentHistory) {
    setActiveEntry(entry);
    setSaveError(null);
    setModalMode('edit');
  }

  function closeModal() {
    if (isSaving) return;
    setModalMode(null);
    setActiveEntry(null);
    setSaveError(null);
  }

  function openDeleteDialog(entry: PaymentHistory) {
    setDeleteTarget(entry);
    setDeleteError(null);
  }

  function closeDeleteDialog() {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function handleSave(form: PaymentHistoryFormState) {
    const payload: PaymentHistoryInput = {
      name: form.name,
      placedCompany: form.placedCompany,
      placedJobTitle: form.placedJobTitle,
      status: form.status,
      notes: form.notes,
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      if (modalMode === 'edit' && activeEntry) {
        await updatePaymentHistory(activeEntry.id, payload);
      } else {
        await createPaymentHistory(payload);
      }

      await refetch();
      closeModal();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save payment history record');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deletePaymentHistory(deleteTarget.id);
      await refetch();
      closeDeleteDialog();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete payment history record');
    } finally {
      setIsDeleting(false);
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">Payment history is admin only</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have permission to view this workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Admin Workspace</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Payment History</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Track post-placement payment follow-through with a clean operational view of fully paid cases, extension requests, and records that need immediate attention.
              </p>
            </div>

            <PrimaryButton className="lg:min-w-48" onClick={openCreateModal}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14m7-7H5" />
              </svg>
              Add payment record
            </PrimaryButton>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total records" value={metrics.total} detail="All payment-tracked placements" tone={METRIC_STYLES[0]} />
              <MetricCard label="Settled" value={metrics.settled} detail="Paid on time or fully paid" tone={METRIC_STYLES[1]} />
              <MetricCard label="Extensions" value={metrics.extensions} detail="Cases needing more time" tone={METRIC_STYLES[2]} />
              <MetricCard label="Attention" value={metrics.attention} detail="Not responding or absconded" tone={METRIC_STYLES[3]} />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : data.length === 0 ? (
          <EmptyState onCreate={openCreateModal} />
        ) : (
          <>
            <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px] lg:min-w-[56%]">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, company, title, notes, or status"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <select
                      value={selectedStatus}
                      onChange={(event) => setSelectedStatus(event.target.value as 'ALL' | PaymentHistoryStatus)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none"
                    >
                      <option value="ALL">All statuses</option>
                      {PAYMENT_HISTORY_STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {PAYMENT_HISTORY_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{filteredEntries.length}</span> of {data.length} records
                </div>
              </div>
            </section>

            {filteredEntries.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">No matching records</h2>
                <p className="mt-2 text-sm text-slate-500">Adjust the search term or status filter to find a payment record.</p>
              </div>
            ) : (
              <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[980px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left">
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Placed Company</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Placed Job Title</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Notes</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Updated</th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 text-sm font-semibold text-slate-950">{entry.name}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{entry.placedCompany}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{entry.placedJobTitle}</td>
                          <td className="px-5 py-4 text-sm text-slate-600"><StatusBadge status={entry.status} /></td>
                          <td className="px-5 py-4 text-sm text-slate-600">{previewNotes(entry.notes)}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{formatDate(entry.updatedAt)}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <div className="flex items-center justify-end gap-2">
                              <PrimaryButton className="rounded-lg px-3 py-1.5 text-xs" onClick={() => openEditModal(entry)}>
                                Edit
                              </PrimaryButton>
                              <PrimaryButton className="rounded-lg px-3 py-1.5 text-xs" onClick={() => openDeleteDialog(entry)}>
                                Delete
                              </PrimaryButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-4 p-4 lg:hidden">
                  {filteredEntries.map((entry) => (
                    <article key={entry.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-bold text-slate-950">{entry.name}</h2>
                          <p className="mt-1 text-sm text-slate-600">{entry.placedCompany}</p>
                          <p className="text-sm text-slate-500">{entry.placedJobTitle}</p>
                        </div>
                        <StatusBadge status={entry.status} />
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                        {previewNotes(entry.notes)}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>Updated {formatDate(entry.updatedAt)}</span>
                        <div className="flex items-center gap-2">
                          <PrimaryButton className="rounded-lg px-3 py-1.5 text-xs" onClick={() => openEditModal(entry)}>
                            Edit
                          </PrimaryButton>
                          <PrimaryButton className="rounded-lg px-3 py-1.5 text-xs" onClick={() => openDeleteDialog(entry)}>
                            Delete
                          </PrimaryButton>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {modalMode && (
        <PaymentHistoryModal
          mode={modalMode}
          initialValue={toFormState(activeEntry)}
          saving={isSaving}
          error={saveError}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          entry={deleteTarget}
          deleting={isDeleting}
          error={deleteError}
          onClose={closeDeleteDialog}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}