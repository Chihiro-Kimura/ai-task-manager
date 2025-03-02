'use client';

import { Tag } from '@prisma/client';
import { type JSX, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type TagColor } from '@/lib/constants/colors';

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  tag?: Tag;
  defaultColor: TagColor;
}

export function TagFormModal({
  isOpen,
  onClose,
  onSuccess,
  tag,
  defaultColor,
}: TagFormModalProps): JSX.Element {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState<TagColor>(
    tag?.color ? JSON.parse(tag.color) : defaultColor
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color ? JSON.parse(tag.color) : defaultColor);
    } else {
      setName('');
      setColor(defaultColor);
    }
  }, [tag, defaultColor]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(tag ? `/api/tags/${tag.id}` : '/api/tags', {
        method: tag ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          color: JSON.stringify(color),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tag');
      }

      toast({
        title: tag ? 'タグを更新しました' : 'タグを作成しました',
        variant: 'default',
      });

      await onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save tag:', error);
      toast({
        title: tag ? 'タグの更新に失敗しました' : 'タグの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? 'タグを編集' : 'タグを作成'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="タグ名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {tag ? '更新' : '作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
