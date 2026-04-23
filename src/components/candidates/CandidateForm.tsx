'use client';

import { useState } from 'react';
import { Candidate, CandidateStatus } from '@/types/candidate';
import { createCandidate, updateCandidate } from '@/hooks/useCandidates';

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
  skills: '',
  experience: '',
  preferredRole: '',
  source: '',
};

export default function CandidateForm({ candidate, onSuccess, onCancel }: Props) {
  const isEdit = !!candidate;
  const [form, setForm] = useState({
    fullName: candidate?.fullName ?? EMPTY_FORM.fullName,
    phoneNumber: candidate?.phoneNumber ?? EMPTY_FORM.phoneNumber,
    whatsappNumber: candidate?.whatsappNumber ?? EMPTY_FORM.whatsappNumber,
    email: candidate?.email ?? EMPTY_FORM.email,
    city: candidate?.city ?? EMPTY_FORM.city,
    qualification: candidate?.qualification ?? EMPTY_FORM.qualification,
    skills: candidate?.skills ?? EMPTY_FORM.skills,
    experience: candidate?.experience ?? EMPTY_FORM.experience,
    preferredRole: candidate?.preferredRole ?? EMPTY_FORM.preferredRole,
    source: candidate?.source ?? EMPTY_FORM.source,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500';
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
          <label className={labelClass}>Preferred Role</label>
          <input name="preferredRole" value={form.preferredRole ?? ''} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Experience</label>
          <input name="experience" value={form.experience ?? ''} onChange={handleChange} className={inputClass} placeholder="e.g. 2 years" />
        </div>
        <div>
          <label className={labelClass}>Source</label>
          <input name="source" value={form.source ?? ''} onChange={handleChange} className={inputClass} placeholder="e.g. WhatsApp, Referral" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Skills</label>
        <textarea name="skills" value={form.skills ?? ''} onChange={handleChange} rows={2} className={inputClass} placeholder="e.g. JavaScript, React, Node.js" />
      </div>

      {error && (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50">
          {isLoading ? 'Saving...' : isEdit ? 'Update Candidate' : 'Add Candidate'}
        </button>
      </div>
    </form>
  );
}
