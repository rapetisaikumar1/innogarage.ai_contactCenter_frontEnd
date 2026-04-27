'use client';

import { useState } from 'react';
import { useNotes, createNote, deleteNote, Note } from '@/hooks/useNotes';
import { formatDateTime } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  candidateId: string;
}

export default function NotesList({ candidateId }: Props) {
  const { notes, isLoading, refetch } = useNotes(candidateId);
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createNote(candidateId, content.trim());
      setContent('');
      refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(note: Note) {
    if (!window.confirm('Delete this note?')) return;
    setDeletingId(note.id);
    try {
      await deleteNote(candidateId, note.id);
      refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Add a note..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">{content.length}/2000</span>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Add Note'}
          </button>
        </div>
      </form>

      {/* Notes list */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-400">No notes yet. Add one above.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => {
            const canDelete =
              user?.role === 'ADMIN' || note.user.id === user?.id;
            return (
              <li key={note.id} className="border-b border-gray-100 pb-3 last:border-0">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400">
                    {note.user.name} · {formatDateTime(note.createdAt)}
                  </p>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(note)}
                      disabled={deletingId === note.id}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === note.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
