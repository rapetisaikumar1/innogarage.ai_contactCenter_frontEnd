'use client';

import { ReactNode, useDeferredValue, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  createPaymentHistory,
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

const DEFAULT_STATUS: PaymentHistoryStatus = 'PAID_ON_TIME';

const STATUS_BADGE_CLASSES: Record<PaymentHistoryStatus, string> = {
  PAID_ON_TIME: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  ASKED_FOR_EXTENSION: 'border border-amber-200 bg-amber-50 text-amber-700',
  FULLY_PAID: 'border border-green-200 bg-green-50 text-green-700',
  NOT_RESPONDING: 'border border-rose-200 bg-rose-50 text-rose-700',
  ABSCONDED: 'border border-red-200 bg-red-50 text-red-700',
};

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

function IconButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M16.862 3.487a2.1 2.1 0 113.03 2.91L8.82 17.926l-4.11.6.728-4.082L16.862 3.487z"
        />
      </svg>
    </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            {mode === 'create' ? 'Add payment record' : 'Edit payment record'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                maxLength={120}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                placeholder="Enter candidate name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Placed company</label>
              <input
                value={form.placedCompany}
                onChange={(event) => update('placedCompany', event.target.value)}
                maxLength={120}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Placed job title</label>
              <input
                value={form.placedJobTitle}
                onChange={(event) => update('placedJobTitle', event.target.value)}
                maxLength={120}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                placeholder="Enter placed job title"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(event) => update('status', event.target.value as PaymentHistoryStatus)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              >
                {PAYMENT_HISTORY_STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {PAYMENT_HISTORY_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              maxLength={2000}
              rows={4}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              placeholder="Add any payment timeline context, follow-up detail, or risk note"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create record' : 'Save changes'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">No payment records yet</h3>
      <p className="mt-1.5 text-sm text-slate-500">Add the first record to track placement payments and risk signals.</p>
      <PrimaryButton className="mt-4" onClick={onCreate}>
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
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : 'No notes added';
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    <div className="mx-auto flex max-w-7xl flex-col gap-5 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Payment History</h1>
          <p className="mt-1 text-sm text-slate-500">Track placement payment status and follow-through for each candidate.</p>
        </div>
        <PrimaryButton onClick={openCreateModal}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14m7-7H5" />
          </svg>
          Add payment record
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">Total records</p>
          <p className="mt-1 text-xl font-semibold text-slate-950 tabular-nums">{data.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-xs text-emerald-700">Settled</p>
          <p className="mt-1 text-xl font-semibold text-emerald-900 tabular-nums">{metrics.settled}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 shadow-sm">
          <p className="text-xs text-amber-700">Extensions</p>
          <p className="mt-1 text-xl font-semibold text-amber-900 tabular-nums">{metrics.extensions}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 shadow-sm">
          <p className="text-xs text-rose-700">Attention</p>
          <p className="mt-1 text-xl font-semibold text-rose-900 tabular-nums">{metrics.attention}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState onCreate={openCreateModal} />
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-xl border border-slate-200 px-3 py-2">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, company, title, or status"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="rounded-xl border border-slate-200 px-3 py-2">
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
              {filteredEntries.length} of {data.length} records
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-950">No matching records</p>
              <p className="mt-1 text-sm text-slate-500">Adjust the search term or status filter.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Saved Records</h2>
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1120px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="w-44 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Name</th>
                      <th className="w-48 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Placed Company</th>
                      <th className="w-48 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Placed Job Title</th>
                      <th className="w-44 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status</th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Notes</th>
                      <th className="w-36 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Updated</th>
                      <th className="w-20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="align-top hover:bg-slate-50/70">
                        <td className="px-5 py-4 text-sm font-semibold text-slate-950">{entry.name}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{entry.placedCompany}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{entry.placedJobTitle}</td>
                        <td className="px-5 py-4 text-sm"><StatusBadge status={entry.status} /></td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          <p
                            className="max-w-[420px] truncate leading-6 text-slate-500"
                            title={previewNotes(entry.notes)}
                          >
                            {previewNotes(entry.notes)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">{formatDate(entry.updatedAt)}</td>
                        <td className="px-5 py-4 text-sm">
                          <div className="flex items-center justify-end">
                            <IconButton label={`Edit ${entry.name}`} onClick={() => openEditModal(entry)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{entry.name}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{entry.placedCompany}</p>
                        <p className="text-xs text-slate-500">{entry.placedJobTitle}</p>
                      </div>
                      <StatusBadge status={entry.status} />
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Notes</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600" title={previewNotes(entry.notes)}>
                        {previewNotes(entry.notes)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Updated {formatDate(entry.updatedAt)}</span>
                      <IconButton label={`Edit ${entry.name}`} onClick={() => openEditModal(entry)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

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
    </div>
  );
}