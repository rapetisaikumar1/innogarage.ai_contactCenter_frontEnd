import { CandidateFile } from '@/hooks/useFiles';
import { toAbsoluteApiUrl } from '@/lib/api';

const OFFICE_DOCUMENT_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function buildOfficeOnlineViewerUrl(fileUrl: string): string {
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
}

export function getCandidateFileViewerHref(file: Pick<CandidateFile, 'url' | 'viewUrl' | 'mimeType'>): string {
  const displayUrl = file.viewUrl ? toAbsoluteApiUrl(file.viewUrl) : file.url;

  if (!displayUrl) {
    return '#';
  }

  if (file.mimeType === 'application/pdf' || file.mimeType.startsWith('image/')) {
    return displayUrl;
  }

  if (OFFICE_DOCUMENT_TYPES.has(file.mimeType) && /^https?:\/\//i.test(displayUrl)) {
    return buildOfficeOnlineViewerUrl(displayUrl);
  }

  return displayUrl;
}