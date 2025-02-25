'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit2, Trash2 } from 'lucide-react';
import { useState, type JSX } from 'react';

import { EditButton, DeleteButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type TagColor } from '@/lib/constants/colors';
import { NoteWithTags } from '@/types/note';

interface NoteItemProps {
  note: NoteWithTags;
  onMutate: () => Promise<void>;
  onEdit: () => void;
}

export default function NoteItem({
  note,
  onMutate,
  onEdit,
}: NoteItemProps): JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (): Promise<void> => {
    if (!confirm('このメモを削除してもよろしいですか？')) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      toast({
        title: 'メモを削除しました',
        variant: 'default',
      });

      await onMutate();
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast({
        title: 'メモの削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-100">
              {note.title}
            </h3>
            {note.priority && (
              <Badge
                variant="outline"
                className={`${
                  note.priority === '高'
                    ? 'border-rose-500/50 text-rose-400'
                    : note.priority === '中'
                    ? 'border-amber-500/50 text-amber-400'
                    : 'border-emerald-500/50 text-emerald-400'
                }`}
              >
                優先度: {note.priority}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <EditButton onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </EditButton>
            <DeleteButton onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
            </DeleteButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-zinc-300">
        <p className="whitespace-pre-wrap">{note.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => {
            let tagColor: TagColor | null = null;
            try {
              if (tag.color) {
                tagColor = JSON.parse(tag.color) as TagColor;
              }
            } catch (e) {
              console.error('Failed to parse tag color:', e);
            }

            return (
              <Badge
                key={tag.id}
                variant="secondary"
                className="bg-zinc-800 text-zinc-300"
                style={{
                  backgroundColor: tagColor?.bg || 'rgba(55, 65, 81, 0.15)',
                  color: tagColor?.color || 'rgb(156, 163, 175)',
                }}
              >
                {tag.name}
              </Badge>
            );
          })}
        </div>
        <p className="text-xs text-zinc-500">
          作成:{' '}
          {format(new Date(note.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
        </p>
      </CardFooter>
    </Card>
  );
}
