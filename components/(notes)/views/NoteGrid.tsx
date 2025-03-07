'use client';

import { type ReactElement } from 'react';

import { NoteCard } from '@/components/(notes)/card/NoteCard';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/hooks/use-notes';
import { NoteFilter } from '@/types/note';

interface NoteGridProps {
  filter: NoteFilter;
}

export function NoteGrid({ filter }: NoteGridProps): ReactElement {
  const { notes, isLoading, mutate, pagination } = useNotes({
    ...filter,
    page: filter.page ?? 1,
    limit: filter.limit ?? 12,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (!notes?.length) {
    return (
      <div className="text-center text-zinc-500">
        メモが見つかりません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onDelete={mutate}
            onUpdate={mutate}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => filter.onPageChange?.(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            前のページ
          </Button>
          <span className="text-sm text-zinc-400">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => filter.onPageChange?.(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            次のページ
          </Button>
        </div>
      )}
    </div>
  );
} 