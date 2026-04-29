'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const OFFICE_DOCUMENT_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function getEmbedSource(url: string, mimeType: string, localSource: boolean): string | null {
  if (!url) {
    return null;
  }

  if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    return url;
  }

  if (OFFICE_DOCUMENT_TYPES.has(mimeType) && !localSource) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }

  if (!localSource && /^https?:/i.test(url)) {
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
  }

  return null;
}

export default function BgcDocumentViewerPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') ?? '';
  const mimeType = searchParams.get('mimeType') ?? '';
  const name = searchParams.get('name') ?? 'Document';
  const localSource = searchParams.get('local') === '1';

  const embedSource = useMemo(() => getEmbedSource(url, mimeType, localSource), [url, mimeType, localSource]);
  const isImage = mimeType.startsWith('image/');

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col gap-5 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/bgc" className="text-sm font-semibold text-slate-500 hover:text-slate-900">Back to BGC</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Document Viewer</h1>
          <p className="mt-1 text-sm text-slate-500">{name}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => window.print()} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Save as PDF
          </button>
          <a href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-black bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-slate-50">
            Open Original
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {!embedSource ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <h2 className="text-lg font-bold text-slate-950">Preview is not available for this file type here</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              If this is a local Office document selected before save, preview becomes available after the record is saved. You can still use Open Original if your browser supports it.
            </p>
          </div>
        ) : isImage ? (
          <div className="flex min-h-[60vh] items-center justify-center overflow-hidden rounded-2xl bg-slate-100 p-4">
            {/* Dynamic preview URLs may be local blobs or third-party documents, so keep the raw image element here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={embedSource} alt={name} className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-sm" />
          </div>
        ) : (
          <iframe src={embedSource} title={name} className="min-h-[75vh] w-full rounded-2xl border border-slate-200" />
        )}
      </div>
    </div>
  );
}