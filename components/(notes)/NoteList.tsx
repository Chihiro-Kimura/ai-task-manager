'use client';

import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Note, NoteFilter } from '@/types/note';

import { NoteFilterBar } from './filters/NoteFilterBar';
import { NoteFormModal } from './modals/NoteFormModal';
import { NoteGrid } from './views/NoteGrid';
import { NoteTable } from './views/NoteTable';
import { ViewToggle } from './views/ViewToggle';

export default function NoteList(): ReactElement {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState<NoteFilter>({});

  const handleCreateNote = async () => {
    if (!session?.user) {
      toast({
        title: 'エラー',
        description: 'ログインが必要です',
        variant: 'destructive',
      });
      return;
    }
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">メモ一覧</h1>
        <div className="flex items-center gap-4">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <Button onClick={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            新規メモ
          </Button>
        </div>
      </div>

      <NoteFilterBar filter={filter} onFilterChange={setFilter} />

      {viewMode === 'grid' ? (
        <NoteGrid filter={filter} />
      ) : (
        <NoteTable filter={filter} />
      )}

      <NoteFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
} 