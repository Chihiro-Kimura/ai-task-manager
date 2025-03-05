'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import TagSelect from '@/components/(common)/forms/TagSelect';
import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import { PrioritySelect } from '@/components/(tasks)/filters/PrioritySelect';
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
import { useTaskStore } from '@/store/taskStore';
import { type TaskWithExtras } from '@/types/task';

const formSchema = z.object({
  title: z.string()
    .min(1, { message: 'タイトルを入力してください' })
    .max(100, { message: 'タイトルは100文字以内で入力してください' })
    .trim(),
  description: z.string()
    .max(1000, { message: '説明は1000文字以内で入力してください' })
    .optional()
    .transform(v => v === '' ? undefined : v),
  priority: z.enum(['高', '中', '低'], {
    errorMap: () => ({ message: '優先度は「高」「中」「低」のいずれかを選択してください' })
  }).nullable(),
  dueDate: z.date({
    errorMap: () => ({ message: '有効な日付を選択してください' })
  }).nullable(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().nullable().optional(),
    })
  ).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  task: TaskWithExtras;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function EditTaskForm({ task, onClose, onSubmit }: EditTaskFormProps): ReactElement {
  const { setIsEditModalOpen } = useTaskStore();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      tags: task.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })) ?? [],
    },
  });

  const handleClose = (): void => {
    setIsEditModalOpen(false);
    onClose();
  };

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      await onSubmit(values);
      toast({
        title: 'タスクを更新しました',
        variant: 'default',
      });
      handleClose();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'エラーが発生しました',
        description: error instanceof Error ? error.message : 'タスクの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleTextAreaResize = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        draggable="false"
        className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg shadow-lg w-[480px] z-50 pointer-events-auto select-none cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-zinc-100 select-none cursor-default">
          タスクを編集
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        draggable="false"
                        placeholder="タイトル"
                        className="mb-3 bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder:text-zinc-400 cursor-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>優先度</FormLabel>
                      <FormControl>
                        <PrioritySelect
                          value={field.value}
                          onValueChange={field.onChange}
                          allowClear
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>締切日</FormLabel>
                      <FormControl>
                        <DueDatePicker
                          dueDate={field.value}
                          setDueDate={field.onChange}
                          variant="full"
                          hideLabel
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[100px] resize-none overflow-hidden"
                        onInput={handleTextAreaResize}
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
                      <TagSelect
                        selectedTags={field.value}
                        onTagsChange={field.onChange}
                        variant="default"
                        noBorder
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={handleClose}
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-red-900/20 hover:text-red-400 text-zinc-400"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="hover:bg-emerald-900/20 hover:text-emerald-400 text-zinc-400"
              >
                更新
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
