'use client';

import { Plus, StickyNote } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import useSWR from 'swr';

import ErrorState from '@/components/(common)/error/ErrorState';
import LoadingState from '@/components/(common)/loading/LoadingState';
import NoteFormModal from '@/components/(notes)/modals/NoteFormModal';
import { AddButton } from '@/components/ui/action-button';
import { useToast } from '@/hooks/use-toast';
import { NoteWithTags } from '@/types/note';

import NoteItem from './NoteItem';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function NoteList(): JSX.Element {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithTags | undefined>();

  // useSWRを使用してメモを取得
  const {
    data: notes,
    error,
    isLoading,
    mutate: mutateNotes,
  } = useSWR<NoteWithTags[]>(
    session?.user?.id ? '/api/notes' : null,
    async (url: string) => {
      if (!session?.user?.id) return [];

      if (isDevelopment) {
        console.log('🔍 Fetching notes for user:', session.user.id);
      }

      const response = await fetch(url, {
        headers: {
          'X-User-Id': session.user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      if (isDevelopment) {
        console.log('✅ Notes fetched:', data.length);
      }
      return data;
    }
  );

  const handleAddNote = (): void => {
    setSelectedNote(undefined);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: NoteWithTags): void => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <>
      <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg min-h-[80vh] max-h-[85vh] flex flex-col">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-100">
            <StickyNote className="h-5 w-5" />
            メモ一覧
          </h2>
          <AddButton onClick={handleAddNote} title="新規メモ">
            <Plus className="h-4 w-4" />
          </AddButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
          {notes?.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onMutate={mutateNotes}
              onEdit={() => handleEditNote(note)}
            />
          ))}
        </div>
      </div>

      <NoteFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNote(undefined);
        }}
        onSuccess={async () => {
          await mutateNotes();
        }}
        note={selectedNote}
      />
    </>
  );
}
