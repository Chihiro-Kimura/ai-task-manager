'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
          <h3 className="text-lg font-semibold text-zinc-100">{note.title}</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-red-500 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-zinc-300">
        <p className="whitespace-pre-wrap">{note.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="bg-zinc-800 text-zinc-300"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-zinc-500">
          作成:{' '}
          {format(new Date(note.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
        </p>
      </CardFooter>
    </Card>
  );
}
