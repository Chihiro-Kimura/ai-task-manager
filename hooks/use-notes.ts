import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { Note, NoteFilter } from '@/types/note';

interface UseNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

export function useNotes(filter: NoteFilter): UseNotesReturn {
  const { data: session } = useSession();

  const {
    data: notes,
    isLoading,
    error,
    mutate,
  } = useSWR<Note[]>(
    session?.user ? ['/api/notes', filter] : null,
    async ([url, filter]) => {
      const params = new URLSearchParams();
      if (filter.search) params.append('search', filter.search);
      if (filter.type?.length)
        params.append('type', filter.type.join(','));
      if (filter.priority?.length)
        params.append('priority', filter.priority.join(','));
      if (filter.tags?.length)
        params.append('tags', filter.tags.join(','));
      if (filter.isArchived !== undefined)
        params.append('isArchived', String(filter.isArchived));
      if (filter.parentNoteId !== undefined)
        params.append('parentNoteId', filter.parentNoteId ?? 'null');
      if (filter.sort) params.append('sort', filter.sort);

      const response = await fetch(
        `${url}?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      return response.json();
    }
  );

  return {
    notes: notes ?? [],
    isLoading,
    error,
    mutate,
  };
}