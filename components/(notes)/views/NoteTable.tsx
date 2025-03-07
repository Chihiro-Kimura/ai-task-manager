'use client';

import { MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactElement, useState } from 'react';
import { toast } from 'sonner';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNotes } from '@/hooks/use-notes';
import { formatDate } from '@/lib/utils/date';
import { NoteFilter } from '@/types/note';

import { NoteFormModal } from '../modals/NoteFormModal';

interface NoteTableProps {
  filter: NoteFilter;
}

export function NoteTable({ filter }: NoteTableProps): ReactElement {
  const router = useRouter();
  const { notes, isLoading, mutate, pagination } = useNotes({
    ...filter,
    page: filter.page ?? 1,
    limit: filter.limit ?? 12,
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (noteId: string): Promise<void> => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('メモの削除に失敗しました');
      }

      toast.success('メモを削除しました');
      await mutate();
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('メモの削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setDeletingNoteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-zinc-800"
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>タグ</TableHead>
            <TableHead>優先度</TableHead>
            <TableHead>作成日時</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow
              key={note.id}
              className="cursor-pointer"
              onClick={() => setEditingNoteId(note.id)}
            >
              <TableCell className="font-medium">{note.title}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <ColoredTag key={tag.id} tag={tag} />
                  ))}
                </div>
              </TableCell>
              <TableCell>{note.priority}</TableCell>
              <TableCell>{formatDate(note.createdAt)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingNoteId(note.id)}>
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingNoteId(note.id)}
                      className="text-red-500"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

      {editingNoteId && (
        <NoteFormModal
          isOpen={true}
          onClose={() => setEditingNoteId(null)}
          note={notes.find((note) => note.id === editingNoteId)}
          onSuccess={async () => {
            await mutate();
            setEditingNoteId(null);
          }}
        />
      )}

      <AlertDialog open={!!deletingNoteId} onOpenChange={() => setDeletingNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メモの削除</AlertDialogTitle>
            <AlertDialogDescription>
              このメモを削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={async () => {
                if (deletingNoteId) {
                  await handleDelete(deletingNoteId);
                }
              }}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}