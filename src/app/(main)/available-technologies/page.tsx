'use client';

import { useDeferredValue, useState } from 'react';
import {
  createAvailableTechnology,
  deleteAvailableTechnology,
  updateAvailableTechnology,
  useAvailableTechnologies,
} from '@/hooks/useAvailableTechnologies';
import {
  AvailableTechnology,
  TECHNOLOGY_CATEGORY_LABELS,
  TECHNOLOGY_CATEGORY_ORDER,
  TECHNOLOGY_CATEGORY_SUMMARIES,
  TechnologyCategory,
} from '@/types';

type TechnologyFormState = {
  name: string;
  category: TechnologyCategory;
  description: string;
};

type TechnologyModalProps = {
  mode: 'create' | 'edit';
  initialValue: TechnologyFormState;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (value: TechnologyFormState) => Promise<void>;
};

type DeleteDialogProps = {
  technologyName: string;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DEFAULT_CATEGORY: TechnologyCategory = 'MARKETING_AUTOMATION_ADOBE_STACK';

const CATEGORY_STYLES: Record<
  TechnologyCategory,
  {
    header: string;
    badge: string;
    dot: string;
    accent: string;
  }
> = {
  MARKETING_AUTOMATION_ADOBE_STACK: {
    header: 'bg-sky-50',
    badge: 'border border-sky-200 bg-sky-100 text-sky-700',
    dot: 'bg-sky-500',
    accent: 'bg-sky-500',
  },
  DATA_ANALYTICS_CDP: {
    header: 'bg-cyan-50',
    badge: 'border border-cyan-200 bg-cyan-100 text-cyan-700',
    dot: 'bg-cyan-500',
    accent: 'bg-cyan-500',
  },
  CORE_ENGINEERING_DEVELOPMENT: {
    header: 'bg-emerald-50',
    badge: 'border border-emerald-200 bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    accent: 'bg-emerald-500',
  },
  AUTOMATION_TESTING_VALIDATION: {
    header: 'bg-amber-50',
    badge: 'border border-amber-200 bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    accent: 'bg-amber-500',
  },
  INFRASTRUCTURE_OPERATIONS: {
    header: 'bg-teal-50',
    badge: 'border border-teal-200 bg-teal-100 text-teal-700',
    dot: 'bg-teal-500',
    accent: 'bg-teal-500',
  },
  ENTERPRISE_TOOLS_BUSINESS_SYSTEMS: {
    header: 'bg-rose-50',
    badge: 'border border-rose-200 bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
    accent: 'bg-rose-500',
  },
  SEMICONDUCTOR_HARDWARE: {
    header: 'bg-indigo-50',
    badge: 'border border-indigo-200 bg-indigo-100 text-indigo-700',
    dot: 'bg-indigo-500',
    accent: 'bg-indigo-500',
  },
  MISC_OTHER: {
    header: 'bg-slate-100',
    badge: 'border border-slate-200 bg-white text-slate-700',
    dot: 'bg-slate-500',
    accent: 'bg-slate-500',
  },
};

function PrimaryButton({
  children,
  className = '',
  type = 'button',
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
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

function OutlineActionButton({
  children,
  className = '',
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl border border-slate-950 bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function TechnologyModal({ mode, initialValue, saving, error, onClose, onSubmit }: TechnologyModalProps) {
  const [form, setForm] = useState<TechnologyFormState>(initialValue);

  function update<K extends keyof TechnologyFormState>(field: K, value: TechnologyFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Available Technologies</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {mode === 'create' ? 'Add technology' : 'Edit technology'}
            </h2>
          </div>
          <PrimaryButton className="h-10 w-10 rounded-full px-0" onClick={onClose}>
            <span className="text-lg leading-none">&times;</span>
          </PrimaryButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">Technology name</label>
              <input
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                maxLength={100}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                placeholder="Enter technology name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">Category</label>
              <select
                value={form.category}
                onChange={(event) => update('category', event.target.value as TechnologyCategory)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              >
                {TECHNOLOGY_CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {TECHNOLOGY_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              rows={4}
              maxLength={240}
              className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              placeholder="Add a short note to describe how this capability is used."
            />
            <p className="text-xs text-slate-400">Optional. Keep it short and practical.</p>
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
            <PrimaryButton type="submit" className="sm:min-w-32" disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create technology' : 'Save changes'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDialog({ technologyName, deleting, error, onClose, onConfirm }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Remove Technology</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Delete {technologyName}?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This removes the technology from the shared list for both admin and agent portals.
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
            {deleting ? 'Deleting...' : 'Delete technology'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-3xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 3.104v5.714a2.143 2.143 0 01-2.143 2.143H3.321m6.429-7.857H15.75a2.25 2.25 0 012.25 2.25V9m0 0h2.679m-2.679 0v8.25A2.25 2.25 0 0115.75 19.5h-7.5A2.25 2.25 0 016 17.25v-1.5m0 0H3.321m2.679 0h3.75" />
        </svg>
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-950">No technologies found</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Start the library with a technology record, then keep the list current for both admin and agent teams.
      </p>
      <PrimaryButton className="mt-6" onClick={onCreate}>
        Add first technology
      </PrimaryButton>
    </div>
  );
}

function toFormState(technology?: AvailableTechnology | null): TechnologyFormState {
  return {
    name: technology?.name ?? '',
    category: technology?.category ?? DEFAULT_CATEGORY,
    description: technology?.description ?? '',
  };
}

export default function AvailableTechnologiesPage() {
  const { data, isLoading, error, refetch } = useAvailableTechnologies();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | TechnologyCategory>('ALL');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeTechnology, setActiveTechnology] = useState<AvailableTechnology | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const filteredTechnologies = data.filter((technology) => {
    const matchesCategory = selectedCategory === 'ALL' || technology.category === selectedCategory;
    const matchesSearch =
      deferredSearch.trim().length === 0 ||
      technology.name.toLowerCase().includes(deferredSearch.trim().toLowerCase()) ||
      TECHNOLOGY_CATEGORY_LABELS[technology.category].toLowerCase().includes(deferredSearch.trim().toLowerCase()) ||
      technology.description?.toLowerCase().includes(deferredSearch.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const groupedTechnologies = TECHNOLOGY_CATEGORY_ORDER.map((category) => ({
    category,
    items: filteredTechnologies.filter((technology) => technology.category === category),
  })).filter((group) => group.items.length > 0);

  const totalCategories = new Set(data.map((technology) => technology.category)).size;
  const technologiesWithDescriptions = data.filter((technology) => technology.description).length;

  function openCreateModal() {
    setSaveError(null);
    setActiveTechnology(null);
    setModalMode('create');
  }

  function openEditModal(technology: AvailableTechnology) {
    setSaveError(null);
    setActiveTechnology(technology);
    setModalMode('edit');
  }

  function closeModal() {
    if (isSaving) return;
    setModalMode(null);
    setActiveTechnology(null);
    setSaveError(null);
  }

  async function handleCreateOrUpdate(form: TechnologyFormState) {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description || undefined,
      };

      if (modalMode === 'edit' && activeTechnology) {
        await updateAvailableTechnology(activeTechnology.id, payload);
      } else {
        await createAvailableTechnology(payload);
      }

      await refetch();
      closeModal();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save technology');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTechnology() {
    if (!activeTechnology) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAvailableTechnology(activeTechnology.id);
      await refetch();
      setActiveTechnology(null);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete technology');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(255,255,255,1),_rgba(248,250,252,0.96))] shadow-sm">
          <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.3fr_0.9fr] xl:items-center">
            <div className="flex gap-4">
              <div className="hidden w-1 rounded-full bg-slate-950 sm:block" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Resource Directory</p>
                <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Available Technologies
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Maintain a shared technology library for admin and agent teams with a clean, searchable catalogue and fast CRUD actions.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard value={String(data.length)} label="Technologies tracked" />
              <StatCard value={String(totalCategories)} label="Active categories" />
              <StatCard value={String(technologiesWithDescriptions)} label="Documented entries" />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px] xl:w-[70%]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Search
                </label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by technology or category"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value as 'ALL' | TechnologyCategory)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                >
                  <option value="ALL">All categories</option>
                  {TECHNOLOGY_CATEGORY_ORDER.map((category) => (
                    <option key={category} value={category}>
                      {TECHNOLOGY_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PrimaryButton className="xl:min-w-52" onClick={openCreateModal}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14m7-7H5" />
              </svg>
              Add technology
            </PrimaryButton>
          </div>
        </section>

        {error && (
          <section className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            {error}
          </section>
        )}

        {isLoading ? (
          <LoadingCard />
        ) : filteredTechnologies.length === 0 ? (
          <EmptyState onCreate={openCreateModal} />
        ) : (
          <section className="space-y-5">
            {groupedTechnologies.map((group) => (
              <div key={group.category} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className={`border-b border-slate-200 px-6 py-5 ${CATEGORY_STYLES[group.category].header}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-950">
                          {TECHNOLOGY_CATEGORY_LABELS[group.category]}
                        </h2>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[group.category].badge}`}>
                          <span className={`h-2 w-2 rounded-full ${CATEGORY_STYLES[group.category].dot}`} />
                          {group.items.length}
                        </span>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {TECHNOLOGY_CATEGORY_SUMMARIES[group.category]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((technology) => (
                    <article
                      key={technology.id}
                      className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className={`absolute inset-x-0 top-0 h-1 ${CATEGORY_STYLES[group.category].accent}`} />
                      <div className="relative">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-bold text-slate-950">{technology.name}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {technology.description || 'No description added yet. Use edit to add context for the team.'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                          <OutlineActionButton className="px-4 py-2 text-sm" onClick={() => openEditModal(technology)}>
                              Edit
                          </OutlineActionButton>
                          <OutlineActionButton className="px-4 py-2 text-sm" onClick={() => { setDeleteError(null); setActiveTechnology(technology); }}>
                              Delete
                          </OutlineActionButton>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {modalMode && (
          <TechnologyModal
            mode={modalMode}
            initialValue={toFormState(activeTechnology)}
            saving={isSaving}
            error={saveError}
            onClose={closeModal}
            onSubmit={handleCreateOrUpdate}
          />
        )}

        {activeTechnology && !modalMode && (
          <DeleteDialog
            technologyName={activeTechnology.name}
            deleting={isDeleting}
            error={deleteError}
            onClose={() => {
              if (isDeleting) return;
              setActiveTechnology(null);
              setDeleteError(null);
            }}
            onConfirm={handleDeleteTechnology}
          />
        )}
      </div>
    </div>
  );
}