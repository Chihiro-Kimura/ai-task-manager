'use client';

import { type ReactElement } from 'react';

import { NoteCard } from '@/components/(notes)/card/NoteCard';
import { useNotes } from '@/hooks/use-notes';
import { NoteFilter } from '@/types/note';

interface NoteGridProps {
  filter: NoteFilter;
}

export function NoteGrid({ filter }: NoteGridProps): ReactElement {
  const { notes, isLoading, mutate } = useNotes(filter);

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
  );
} 