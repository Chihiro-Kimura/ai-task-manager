'use client';

import { type Note } from '@prisma/client';
import { Pencil, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';

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
import { cn } from '@/lib/utils/styles';

import { RichTextEditor } from '../editor/RichTextEditor';

import { CategorySelect } from './CategorySelect';
import { type NoteFormValues } from './note-form-schema';
import { PrioritySelect } from './PrioritySelect';
import { TagInput } from './TagInput';
import { useNoteForm } from './use-note-form';

interface AddNoteFormProps {
  className?: string;
  note?: Note;
  onSubmit: (note: Note) => Promise<void>;
}

export function AddNoteForm({ className, note, onSubmit }: AddNoteFormProps): ReactElement {
  const router = useRouter();
  const {
    form,
    isRichText,
    setIsRichText,
    handleSubmit,
  } = useNoteForm({
    defaultValues: note ? {
      title: note.title,
      content: note.content,
      priority: note.priority as '高' | '中' | '低' | undefined,
      category: 'general', // デフォルト値を設定
      tags: [], // タグは別途管理
    } : undefined,
    onSubmit: async (values: NoteFormValues) => {
      // フォームの値をNoteの形式に変換
      const noteData = {
        ...(note ?? {}), // 編集時は既存のデータを保持
        title: values.title,
        content: values.content,
        priority: values.priority ?? null,
        // 新規作成時のみ使用
        id: note?.id ?? '',
        userId: note?.userId ?? '',
        createdAt: note?.createdAt ?? new Date(),
        updatedAt: new Date(),
      } satisfies Note;

      await onSubmit(noteData);
      router.refresh();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
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

        <div className="flex items-center justify-between">
          <FormLabel>内容</FormLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsRichText(!isRichText)}
            className="h-7 px-2 text-xs"
          >
            {isRichText ? (
              <>
                <Type className="mr-1 h-4 w-4" />
                プレーンテキスト
              </>
            ) : (
              <>
                <Pencil className="mr-1 h-4 w-4" />
                リッチテキスト
              </>
            )}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {isRichText ? (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="内容を入力..."
                  />
                ) : (
                  <Textarea
                    placeholder="内容を入力..."
                    className="min-h-[200px]"
                    {...field}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カテゴリー</FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
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
                <FormControl>
                  <PrioritySelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タグ</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          {note ? '更新' : '作成'}
        </Button>
      </form>
    </Form>
  );
}
