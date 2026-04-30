'use client';

import { useState, useRef } from 'react';
import { useFiles, uploadFile, deleteFile, CandidateFile } from '@/hooks/useFiles';
import { useAuth } from '@/hooks/useAuth';
import { getCandidateFileViewerHref } from '@/lib/candidateFileViewer';
import { formatDateTime } from '@/utils/formatters';

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp,.svg,.pdf,.doc,.docx,.xls,.xlsx';
const MAX_SIZE_MB = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  return '📎';
}

interface Props {
  candidateId: string;
}

export default function FilesList({ candidateId }: Props) {
  const { files, isLoading, refetch } = useFiles(candidateId);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File exceeds ${MAX_SIZE_MB} MB limit`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadError(null);

    try {
      await uploadFile(candidateId, file, setProgress);
      refetch();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input so same file can be re-uploaded after error
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(file: CandidateFile) {
    if (!window.confirm(`Delete "${file.originalName}"?`)) return;
    setDeletingId(file.id);
    try {
      await deleteFile(candidateId, file.id);
      refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />
        <label
          htmlFor="file-upload-input"
          className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-5 cursor-pointer transition-colors text-sm ${
            uploading
              ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {uploading ? (
            <span className="text-blue-600">Uploading... {progress}%</span>
          ) : (
            <>
              <span className="text-gray-400">📎</span>
              <span className="text-gray-600">
                Click to upload a file <span className="text-gray-400">(Images, PDF, Word, Excel · max 10 MB)</span>
              </span>
            </>
          )}
        </label>

        {uploading && (
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {uploadError && (
          <p className="mt-1 text-xs text-red-600">{uploadError}</p>
        )}
      </div>

      {/* Files list */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-sm text-gray-400">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => {
            const canDelete = user?.role === 'ADMIN' || file.uploadedById === user?.id;
            return (
              <li
                key={file.id}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
              >
                <span className="text-xl">{fileIcon(file.mimeType)}</span>
                <div className="flex-1 min-w-0">
                  <a
                    href={getCandidateFileViewerHref(file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline truncate block"
                  >
                    {file.originalName}
                  </a>
                  <p className="text-xs text-gray-400">
                    {formatBytes(file.size)} · {file.uploadedBy.name} · {formatDateTime(file.createdAt)}
                  </p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={deletingId === file.id}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 flex-shrink-0"
                  >
                    {deletingId === file.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
