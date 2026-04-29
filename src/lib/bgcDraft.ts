import { BgcDocument, BgcDocumentField, BgcFileInput, BgcRecord, BgcRecordInput } from '@/types';

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

export type BgcDocumentCollections = Record<BgcDocumentField, BgcDocument[]>;

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
  existingDocuments: BgcDocumentCollections;
  sourcePath: string;
  recordId: string | null;
}

let currentDraft: BgcDraft | null = null;

export function createEmptyBgcFiles(): BgcFileInput {
  return {
    resumeFiles: [],
    usCanadaBgcFiles: [],
    indiaBgcFiles: [],
  };
}

export function createEmptyBgcDocuments(): BgcDocumentCollections {
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

function cloneDocuments(documents: BgcDocumentCollections): BgcDocumentCollections {
  return {
    resumeFiles: documents.resumeFiles.map((document) => ({ ...document })),
    usCanadaBgcFiles: documents.usCanadaBgcFiles.map((document) => ({ ...document })),
    indiaBgcFiles: documents.indiaBgcFiles.map((document) => ({ ...document })),
  };
}

export function getBgcExistingDocuments(record: BgcRecord): BgcDocumentCollections {
  return {
    resumeFiles: record.resumeFiles.map((document) => ({ ...document })),
    usCanadaBgcFiles: record.usCanadaBgcFiles.map((document) => ({ ...document })),
    indiaBgcFiles: record.indiaBgcFiles.map((document) => ({ ...document })),
  };
}

export function toBgcFormInput(record: BgcRecord): BgcRecordInput {
  return {
    fullName: record.fullName,
    dob: record.dob?.slice(0, 10) ?? '',
    usEmployerName: record.usEmployerName ?? '',
    usJobTitle: record.usJobTitle ?? '',
    usFromDate: record.usFromDate?.slice(0, 10) ?? '',
    usToDate: record.usToDate?.slice(0, 10) ?? '',
    usReference1: record.usReference1 ?? '',
    usReference2: record.usReference2 ?? '',
    usReference3: record.usReference3 ?? '',
    indiaEmployerName: record.indiaEmployerName ?? '',
    indiaJobTitle: record.indiaJobTitle ?? '',
    indiaFromDate: record.indiaFromDate?.slice(0, 10) ?? '',
    indiaToDate: record.indiaToDate?.slice(0, 10) ?? '',
    indiaReference1: record.indiaReference1 ?? '',
    indiaReference2: record.indiaReference2 ?? '',
    indiaReference3: record.indiaReference3 ?? '',
  };
}

export function saveBgcDraft(draft: BgcDraft): void {
  currentDraft = {
    form: { ...draft.form },
    files: cloneFiles(draft.files),
    existingDocuments: cloneDocuments(draft.existingDocuments),
    sourcePath: draft.sourcePath,
    recordId: draft.recordId,
  };
}

export function getBgcDraft(): BgcDraft | null {
  if (!currentDraft) {
    return null;
  }

  return {
    form: { ...currentDraft.form },
    files: cloneFiles(currentDraft.files),
    existingDocuments: cloneDocuments(currentDraft.existingDocuments),
    sourcePath: currentDraft.sourcePath,
    recordId: currentDraft.recordId,
  };
}

export function clearBgcDraft(): void {
  currentDraft = null;
}

export function validateBgcDraft(
  form: BgcRecordInput,
  files: BgcFileInput,
  existingDocuments: BgcDocumentCollections = createEmptyBgcDocuments(),
): string[] {
  const errors: string[] = [];

  for (const { field, label } of REQUIRED_FORM_FIELDS) {
    if (!form[field].trim()) {
      errors.push(`${label} is required.`);
    }
  }

  for (const [field, label] of Object.entries(BGC_DOCUMENT_LABELS) as Array<[BgcDocumentField, string]>) {
    const selectedFiles = files[field];
    const currentDocuments = existingDocuments[field];

    if (selectedFiles.length === 0 && currentDocuments.length === 0) {
      errors.push(`${label} is required.`);
    }

    if (selectedFiles.length > 10) {
      errors.push(`${label} accepts up to 10 files.`);
    }
  }

  return errors;
}