'use client';

import { useMemo, useState } from 'react';
import { Candidate, CandidateStatus } from '@/types/candidate';
import { createCandidate, updateCandidate } from '@/hooks/useCandidates';
import { useAvailableTechnologies } from '@/hooks/useAvailableTechnologies';
import { TECHNOLOGY_CATEGORY_LABELS, TECHNOLOGY_CATEGORY_ORDER } from '@/types';

interface Props {
  candidate?: Candidate;
  onSuccess: () => void;
  onCancel: () => void;
}

const EMPTY_FORM = {
  fullName: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  city: '',
  qualification: '',
  experience: '',
  preferredRole: '',
  source: '',
};

export default function CandidateForm({ candidate, onSuccess, onCancel }: Props) {
  const isEdit = !!candidate;
  const { data: availableTechnologies, isLoading: technologiesLoading, error: technologiesError } = useAvailableTechnologies();
  const [form, setForm] = useState({
    fullName: candidate?.fullName ?? EMPTY_FORM.fullName,
    phoneNumber: candidate?.phoneNumber ?? EMPTY_FORM.phoneNumber,
    whatsappNumber: candidate?.whatsappNumber ?? EMPTY_FORM.whatsappNumber,
    email: candidate?.email ?? EMPTY_FORM.email,
    city: candidate?.city ?? EMPTY_FORM.city,
    qualification: candidate?.qualification ?? EMPTY_FORM.qualification,
    experience: candidate?.experience ?? EMPTY_FORM.experience,
    preferredRole: candidate?.preferredRole ?? EMPTY_FORM.preferredRole,
    source: candidate?.source ?? EMPTY_FORM.source,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const technologyGroups = useMemo(
    () => TECHNOLOGY_CATEGORY_ORDER.map((category) => ({
      category,
      label: TECHNOLOGY_CATEGORY_LABELS[category],
      items: availableTechnologies.filter((technology) => technology.category === category),
    })).filter((group) => group.items.length > 0),
    [availableTechnologies],
  );

  const hasLegacyTechnologyValue =
    Boolean(form.preferredRole) &&
    !availableTechnologies.some((technology) => technology.name === form.preferredRole);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateCandidate(candidate!.id, form);
      } else {
        await createCandidate(form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input name="fullName" required value={form.fullName} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone Number *</label>
          <input name="phoneNumber" required value={form.phoneNumber} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp Number</label>
          <input name="whatsappNumber" value={form.whatsappNumber ?? ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" value={form.email ?? ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input name="city" value={form.city ?? ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Qualification</label>
          <input name="qualification" value={form.qualification ?? ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Preferred Technology</label>
          <select
            name="preferredRole"
            value={form.preferredRole ?? ''}
            onChange={handleChange}
            className={inputClass}
            disabled={technologiesLoading}
          >
            <option value="">Select preferred technology</option>
            {hasLegacyTechnologyValue && (
              <option value={form.preferredRole ?? ''}>{form.preferredRole}</option>
            )}
            {technologyGroups.map((group) => (
              <optgroup key={group.category} label={group.label}>
                {group.items.map((technology) => (
                  <option key={technology.id} value={technology.name}>
                    {technology.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {technologiesLoading && (
            <p className="mt-1 text-xs text-gray-400">Loading available technologies...</p>
          )}
          {technologiesError && (
            <p className="mt-1 text-xs text-red-600">{technologiesError}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Visa Status</label>
          <input name="experience" value={form.experience ?? ''} onChange={handleChange} className={inputClass} placeholder="e.g. H1B, OPT, GC" />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <input name="source" value={form.source ?? ''} onChange={handleChange} className={inputClass} placeholder="e.g. USA, India" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
          {isLoading ? 'Saving...' : isEdit ? 'Update Candidate' : 'Add Candidate'}
        </button>
      </div>
    </form>
  );
}
