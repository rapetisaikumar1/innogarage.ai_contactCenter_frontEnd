import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { getSession } from '@/lib/session';

export interface CandidateFile {
  id: string;
  candidateId: string;
  uploadedById: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId: string;
  createdAt: string;
  uploadedBy: { id: string; name: string };
}

export function useFiles(candidateId: string) {
  const [files, setFiles] = useState<CandidateFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<CandidateFile[]>>(`/candidates/${candidateId}/files`);
      setFiles(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchFiles();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchFiles]);

  return { files, isLoading, error, refetch: fetchFiles };
}

export async function uploadFile(
  candidateId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<CandidateFile> {
  const token = getSession()?.token;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiUrl}/candidates/${candidateId}/files`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(json.data);
        } else {
          reject(new Error(json.message ?? 'Upload failed'));
        }
      } catch {
        reject(new Error('Upload failed'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export async function deleteFile(candidateId: string, fileId: string): Promise<void> {
  await api.delete<ApiResponse<null>>(`/candidates/${candidateId}/files/${fileId}`);
}
