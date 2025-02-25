'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Tag } from '@prisma/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z
    .string()
    .min(1, '必須項目です')
    .max(50, '50文字以内で入力してください'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください')
    .optional(),
});

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  tag?: Tag;
}

export default function TagFormModal({
  isOpen,
  onClose,
  onSuccess,
  tag,
}: TagFormModalProps): JSX.Element {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tag?.name ?? '',
      color: tag?.color ?? '#6B7280',
    },
  });

  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name,
        color: tag.color ?? '#6B7280',
      });
    }
  }, [tag, form]);

  const onSubmit = async (
    values: z.infer<typeof formSchema>
  ): Promise<void> => {
    try {
      const response = await fetch(tag ? `/api/tags/${tag.id}` : '/api/tags', {
        method: tag ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tag ? 'タグを編集' : '新規タグ'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タグ名</FormLabel>
                  <FormControl>
                    <Input placeholder="タグの名前" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カラー</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input type="color" className="w-12 h-8 p-1" {...field} />
                      <Input
                        placeholder="#000000"
                        className="flex-1"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">{tag ? '更新' : '作成'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
