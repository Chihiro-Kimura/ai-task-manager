'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CreateNoteData, NoteWithTags } from '@/types/note';

const formSchema = z.object({
  title: z
    .string()
    .min(1, '必須項目です')
    .max(100, '100文字以内で入力してください'),
  content: z
    .string()
    .min(1, '必須項目です')
    .max(1000, '1000文字以内で入力してください'),
  tags: z.array(z.string()).optional(),
});

interface AddNoteFormProps {
  note?: NoteWithTags;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

export default function AddNoteForm({
  note,
  onSuccess,
  onCancel,
}: AddNoteFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
      tags: note?.tags.map((tag) => tag.id) ?? [],
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        tags: note.tags.map((tag) => tag.id),
      });
    }
  }, [note, form]);

  const onSubmit = async (
    values: z.infer<typeof formSchema>
  ): Promise<void> => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        note ? `/api/notes/${note.id}` : '/api/notes',
        {
          method: note ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values as CreateNoteData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      toast({
        title: note ? 'メモを更新しました' : 'メモを作成しました',
        variant: 'default',
      });

      await onSuccess();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast({
        title: note ? 'メモの更新に失敗しました' : 'メモの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input placeholder="メモのタイトル" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>内容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="メモの内容"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : note ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
