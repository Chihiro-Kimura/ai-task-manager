import { useSession } from 'next-auth/react';
import useSWR, { KeyedMutator } from 'swr';

import { Note, NoteFilter } from '@/types/note';

interface UseNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: KeyedMutator<NotesResponse>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface NotesResponse {
  notes: Note[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useNotes(filter: NoteFilter): UseNotesReturn {
  const { data: session } = useSession();

  const {
    data,
    isLoading,
    error,
    mutate,
  } = useSWR<NotesResponse>(
    session?.user ? ['/api/notes', filter] : null,
    async ([url, filterParam]: [string, NoteFilter]) => {
      const params = new URLSearchParams();
      if (filterParam.search) params.append('search', filterParam.search);
      if (filterParam.type?.length)
        params.append('type', filterParam.type.join(','));
      if (filterParam.priority?.length)
        params.append('priority', filterParam.priority.join(','));
      if (filterParam.tags?.length)
        params.append('tags', filterParam.tags.join(','));
      if (filterParam.isArchived !== undefined)
        params.append('isArchived', String(filterParam.isArchived));
      if (filterParam.parentNoteId !== undefined)
        params.append('parentNoteId', filterParam.parentNoteId ?? 'null');
      if (filterParam.sort) params.append('sort', filterParam.sort);
      if (filterParam.page) params.append('page', String(filterParam.page));
      if (filterParam.limit) params.append('limit', String(filterParam.limit));

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
    notes: data?.notes ?? [],
    isLoading,
    error,
    mutate,
    pagination: data?.pagination ?? {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1,
    },
  };
}