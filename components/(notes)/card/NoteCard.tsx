'use client';

import { MoreHorizontal, Trash } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactElement } from 'react';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils/date';
import { Note } from '@/types/note';

import { NoteFormModal } from '../modals/NoteFormModal';

interface NoteCardProps {
  note: Note;
  onDelete?: () => Promise<void>;
  onUpdate?: () => Promise<void>;
}

export function NoteCard({ note, onDelete, onUpdate }: NoteCardProps): ReactElement {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (): Promise<void> => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('メモの削除に失敗しました');
      }

      toast.success('メモを削除しました');
      await onDelete?.();
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('メモの削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Link href={`/notes/${note.id}`}>
        <Card className="flex h-full flex-col transition-colors hover:bg-zinc-900">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                <CardDescription>
                  {formatDate(new Date(note.createdAt))}
                </CardDescription>
              </div>
              <div onClick={(e) => e.preventDefault()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-red-500"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-sm text-zinc-400">{note.content}</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <ColoredTag key={tag.id} tag={tag} />
              ))}
            </div>
          </CardFooter>
        </Card>
      </Link>

      <NoteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={note}
        onSuccess={onUpdate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メモを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 