export interface BgcDocument {
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId: string;
  uploadedAt: string;
}

export interface BgcRecord {
  id: string;
  fullName: string;
  dob: string | null;
  usEmployerName: string | null;
  usJobTitle: string | null;
  usFromDate: string | null;
  usToDate: string | null;
  usReference1: string | null;
  usReference2: string | null;
  usReference3: string | null;
  indiaEmployerName: string | null;
  indiaJobTitle: string | null;
  indiaFromDate: string | null;
  indiaToDate: string | null;
  indiaReference1: string | null;
  indiaReference2: string | null;
  indiaReference3: string | null;
  resumeFiles: BgcDocument[];
  usCanadaBgcFiles: BgcDocument[];
  indiaBgcFiles: BgcDocument[];
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string };
}

export type BgcDocumentField = 'resumeFiles' | 'usCanadaBgcFiles' | 'indiaBgcFiles';

export interface BgcRecordInput {
  fullName: string;
  dob: string;
  usEmployerName: string;
  usJobTitle: string;
  usFromDate: string;
  usToDate: string;
  usReference1: string;
  usReference2: string;
  usReference3: string;
  indiaEmployerName: string;
  indiaJobTitle: string;
  indiaFromDate: string;
  indiaToDate: string;
  indiaReference1: string;
  indiaReference2: string;
  indiaReference3: string;
}

export type BgcFileInput = Record<BgcDocumentField, File[]>;