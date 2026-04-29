import { BgcDocumentField, BgcFileInput, BgcRecordInput } from '@/types';

export const EMPTY_BGC_FORM: BgcRecordInput = {
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

export const BGC_DOCUMENT_LABELS: Record<BgcDocumentField, string> = {
  resumeFiles: 'Resume Used',
  usCanadaBgcFiles: 'US/Canada BGC Documents',
  indiaBgcFiles: 'Indian BGC Documents',
};

const REQUIRED_FORM_FIELDS: Array<{ field: keyof BgcRecordInput; label: string }> = [
  { field: 'fullName', label: 'Full Name' },
  { field: 'dob', label: 'DOB' },
  { field: 'usEmployerName', label: 'US / Canada Employer Name' },
  { field: 'usJobTitle', label: 'US / Canada Job Title' },
  { field: 'usFromDate', label: 'US / Canada From Date' },
  { field: 'usToDate', label: 'US / Canada To Date' },
  { field: 'indiaEmployerName', label: 'Indian Employer Name' },
  { field: 'indiaJobTitle', label: 'Indian Job Title' },
  { field: 'indiaFromDate', label: 'Indian From Date' },
  { field: 'indiaToDate', label: 'Indian To Date' },
];

export interface BgcDraft {
  form: BgcRecordInput;
  files: BgcFileInput;
}

let currentDraft: BgcDraft | null = null;

export function createEmptyBgcFiles(): BgcFileInput {
  return {
    resumeFiles: [],
    usCanadaBgcFiles: [],
    indiaBgcFiles: [],
  };
}

function cloneFiles(files: BgcFileInput): BgcFileInput {
  return {
    resumeFiles: [...files.resumeFiles],
    usCanadaBgcFiles: [...files.usCanadaBgcFiles],
    indiaBgcFiles: [...files.indiaBgcFiles],
  };
}

export function saveBgcDraft(draft: BgcDraft): void {
  currentDraft = {
    form: { ...draft.form },
    files: cloneFiles(draft.files),
  };
}

export function getBgcDraft(): BgcDraft | null {
  if (!currentDraft) {
    return null;
  }

  return {
    form: { ...currentDraft.form },
    files: cloneFiles(currentDraft.files),
  };
}

export function clearBgcDraft(): void {
  currentDraft = null;
}

export function validateBgcDraft(form: BgcRecordInput, files: BgcFileInput): string[] {
  const errors: string[] = [];

  for (const { field, label } of REQUIRED_FORM_FIELDS) {
    if (!form[field].trim()) {
      errors.push(`${label} is required.`);
    }
  }

  for (const [field, label] of Object.entries(BGC_DOCUMENT_LABELS) as Array<[BgcDocumentField, string]>) {
    const selectedFiles = files[field];

    if (selectedFiles.length === 0) {
      errors.push(`${label} is required.`);
    }

    if (selectedFiles.length > 10) {
      errors.push(`${label} accepts up to 10 files.`);
    }
  }

  return errors;
}