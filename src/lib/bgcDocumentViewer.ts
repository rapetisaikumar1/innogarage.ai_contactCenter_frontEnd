import { BgcDocument } from '@/types';

function buildViewerSearchParams(url: string, mimeType: string, name: string, localSource = false): string {
  const params = new URLSearchParams({ url, mimeType, name });

  if (localSource) {
    params.set('local', '1');
  }

  return params.toString();
}

export function getBgcDocumentViewerHref(document: Pick<BgcDocument, 'url' | 'mimeType' | 'originalName'>): string {
  return `/bgc/document-view?${buildViewerSearchParams(document.url, document.mimeType, document.originalName)}`;
}

export function openLocalBgcDocumentViewer(file: File): void {
  const objectUrl = URL.createObjectURL(file);
  const href = `/bgc/document-view?${buildViewerSearchParams(objectUrl, file.type, file.name, true)}`;

  window.open(href, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}