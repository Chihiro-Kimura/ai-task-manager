'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { mutate } from 'swr';
import { z } from 'zod';

import TagSelect from '@/components/(common)/forms/TagSelect';
import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import PrioritySelect from '@/components/(tasks)/filters/PrioritySelect';
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
import { TaskWithExtras } from '@/types/task';

interface Tag {
  id: string;
  name: string;
  color?: string;
}

const formSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  priority: z.string().optional(),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  task: TaskWithExtras;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

export default function EditTaskForm({
  task,
  onSuccess,
  onCancel,
}: EditTaskFormProps): ReactElement {
  const { data: session } = useSession();
  const { setIsEditModalOpen } = useTaskStore();
  const [selectedTags, setSelectedTags] = useState<Tag[]>(task.tags || []);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority || undefined,
      due_date: task.due_date 
        ? typeof task.due_date === 'string'
          ? task.due_date
          : task.due_date.toISOString()
        : undefined,
    },
  });

  const handleClose = (): void => {
    setIsEditModalOpen(false);
    onCancel();
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!session?.user?.id) {
      toast({
        title: 'エラー',
        description: '認証情報が見つかりません',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
        body: JSON.stringify({
          ...values,
          due_date: values.due_date ? new Date(values.due_date) : null,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await onSuccess();
      form.reset();
      mutate('/api/tasks');
      handleClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg shadow-lg w-96 z-50 pointer-events-auto select-none cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-zinc-100 select-none cursor-default">
          タスクを編集
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      draggable="false"
                      placeholder="詳細"
                      className="mb-4 bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder:text-zinc-400 cursor-text"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="mb-4">
              <div className="text-zinc-400 mb-2">優先度 : </div>
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PrioritySelect
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DueDatePicker
                      dueDate={field.value ? new Date(field.value) : undefined}
                      setDueDate={(date) =>
                        field.onChange(date?.toISOString() || '')
                      }
                      className="mb-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>タグ</FormLabel>
              <TagSelect
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="hover:bg-red-900/20 hover:text-red-400 text-zinc-400"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="hover:bg-emerald-900/20 hover:text-emerald-400 text-zinc-400"
              >
                {isLoading ? '更新中...' : '更新'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
