import { BgcDocument } from '@/types';
import { toAbsoluteApiUrl } from '@/lib/api';

const OFFICE_DOCUMENT_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

function buildOfficeOnlineViewerUrl(fileUrl: string): string {
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
}

/**
 * Returns the URL to open in a new tab so the document content is displayed.
 * - PDFs and images: the file URL itself (browsers render them inline).
 * - Office docs on a public URL: Microsoft Office Online viewer (full page).
 * - Anything else: the raw URL and let the browser handle it.
 */
export function getBgcDocumentViewerHref(
  document: Pick<BgcDocument, 'url' | 'viewUrl' | 'mimeType'>,
): string {
  const { url, viewUrl, mimeType } = document;
  const displayUrl = viewUrl ? toAbsoluteApiUrl(viewUrl) : url;

  if (!displayUrl) {
    return '#';
  }

  if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    return displayUrl;
  }

  if (OFFICE_DOCUMENT_TYPES.has(mimeType) && /^https?:\/\//i.test(displayUrl)) {
    return buildOfficeOnlineViewerUrl(displayUrl);
  }

  return displayUrl;
}

/**
 * Opens a not-yet-uploaded local file in a new tab.
 * PDFs/images render inline. Office files cannot be previewed before save
 * because the Office Online viewer needs a public URL.
 */
export function openLocalBgcDocumentViewer(file: File): void {
  const objectUrl = URL.createObjectURL(file);
  window.open(objectUrl, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}