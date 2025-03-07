'use client';

import { ArrowLeft, MoreHorizontal, Trash } from 'lucide-react';
import Link from 'next/link';
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
import { formatDateTime } from '@/lib/utils/date';
import { Note } from '@/types/note';

import { NoteFormModal } from '../modals/NoteFormModal';

import { NoteAnalysis } from './NoteAnalysis';

interface NoteDetailProps {
  note: Note;
}

export function NoteDetail({ note }: NoteDetailProps): ReactElement {
  const router = useRouter();
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
      router.push('/notes');
      router.refresh();
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            asChild
          >
            <Link href="/notes">
              <ArrowLeft className="h-4 w-4" />
              メモ一覧に戻る
            </Link>
          </Button>
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

        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{note.title}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <time>作成: {formatDateTime(note.createdAt)}</time>
                <time>更新: {formatDateTime(note.updatedAt)}</time>
              </div>
            </div>

            {note.priority && (
              <span
                className={`inline-block rounded px-2 py-1 text-sm font-medium ${
                  note.priority === '高'
                    ? 'bg-rose-500/20 text-rose-500'
                    : note.priority === '中'
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'bg-emerald-500/20 text-emerald-500'
                }`}
              >
                優先度: {note.priority}
              </span>
            )}

            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <ColoredTag key={tag.id} tag={tag} />
              ))}
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{note.content}</p>
            </div>
          </div>

          <div className="space-y-4">
            <NoteAnalysis note={note} />
          </div>
        </div>
      </div>

      <NoteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note={note}
        onSuccess={async () => {
          setIsEditModalOpen(false);
          router.refresh();
        }}
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