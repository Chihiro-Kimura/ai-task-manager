'use client';

import { Tag } from '@prisma/client';
import { type JSX, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type TagColor, TAG_COLOR_THEMES } from '@/lib/constants/colors';

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  tag?: Tag;
  defaultColor: TagColor;
}

const PRESET_COLORS = Object.values(TAG_COLOR_THEMES);

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
        method: tag ? 'PATCH' : 'POST',
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
      <DialogContent className="bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle>{tag ? 'タグを編集' : 'タグを作成'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">タグ名</label>
            <Input
              placeholder="タグ名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-zinc-900 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">タグの色</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((presetColor, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`p-2 rounded-md border-2 transition-all ${
                    JSON.stringify(color) === JSON.stringify(presetColor)
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-zinc-700'
                  }`}
                >
                  <Badge
                    variant="secondary"
                    className="w-full"
                    style={{
                      backgroundColor: presetColor.bg,
                      color: presetColor.color,
                    }}
                  >
                    {presetColor.name}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
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
