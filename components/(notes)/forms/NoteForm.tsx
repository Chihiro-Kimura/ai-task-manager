'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import TagSelect from '@/components/(common)/forms/tag-select';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTagManagement } from '@/hooks/use-tag-management';
import { useToast } from '@/hooks/use-toast';
import { CreateNoteData, Note, NOTE_TYPE } from '@/types/note';

const formSchema = z.object({
  title: z.string().min(1, '必須項目です'),
  content: z.string().min(1, '必須項目です'),
  type: z.enum([
    NOTE_TYPE.GENERAL,
    NOTE_TYPE.DIARY,
    NOTE_TYPE.IDEA,
    NOTE_TYPE.REFERENCE,
    NOTE_TYPE.TASK_NOTE,
  ]),
  priority: z.enum(['high', 'medium', 'low']).nullable(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface NoteFormProps {
  note?: Note;
  onSuccess: () => void;
}

export function NoteForm({ note, onSuccess }: NoteFormProps): ReactElement {
  const { data: session } = useSession();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
      type: note?.type ?? NOTE_TYPE.GENERAL,
      priority: note?.priority ?? null,
      tags: note?.tags.map((tag) => tag.id) ?? [],
    },
  });

  const { tags, isLoading, loadTags } = useTagManagement({
    id: note?.id,
    type: 'note',
    initialTags: note?.tags ?? [],
  });

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!session?.user) {
      toast({
        title: 'エラー',
        description: 'ログインが必要です',
        variant: 'destructive',
      });
      return;
    }

    try {
      const noteData: CreateNoteData = {
        title: values.title,
        content: values.content,
        type: values.type,
        priority: values.priority,
        tags: values.tags,
      };

      if (note) {
        await fetch(`/api/notes/${note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });
        toast({
          title: '更新完了',
          description: 'メモを更新しました',
        });
      } else {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });
        toast({
          title: '作成完了',
          description: '新しいメモを作成しました',
        });
      }

      onSuccess();
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'メモの保存に失敗しました',
        variant: 'destructive',
      });
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
                <Input placeholder="タイトルを入力..." {...field} />
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
                  placeholder="メモの内容を入力..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイプ</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="タイプを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(NOTE_TYPE).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>優先度</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="優先度を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タグ</FormLabel>
              <FormControl>
                <TagSelect
                  type="note"
                  selectedTags={field.value.map(id => tags.find(tag => tag.id === id) ?? { id, name: '', color: null, userId: '', createdAt: new Date() })}
                  onTagsChange={(selectedTags) => field.onChange(selectedTags.map(tag => tag.id))}
                  initialTags={tags ?? []}
                  isLoading={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {note ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 