'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactElement, useState } from 'react';
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
import { type Tag } from '@/types/common';
import { type TaskWithExtras } from '@/types/task';

const formSchema = z.object({
  title: z.string().min(1, { message: 'タイトルを入力してください' }),
  description: z.string().optional(),
  priority: z.enum(['高', '中', '低']).nullable(),
  dueDate: z.date().nullable(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  task: TaskWithExtras;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function EditTaskForm({ task, onClose, onSubmit }: EditTaskFormProps): ReactElement {
  const { setIsEditModalOpen } = useTaskStore();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    task.tags?.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    })) ?? []
  );
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      tags: task.tags?.map((tag) => tag.name) ?? [],
    },
  });

  const handleClose = (): void => {
    setIsEditModalOpen(false);
    onClose();
  };

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      console.log('Form values before submit:', values);
      
      const submitData = {
        ...values,
        priority: values.priority ?? null,
        due_date: values.dueDate?.toISOString() ?? null,
        tags: selectedTags.map(tag => tag.name)
      };
      
      console.log('Submitting data:', submitData);
      await onSubmit(submitData);
      
      toast({
        title: 'タスクを更新しました',
      });
      handleClose();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'エラーが発生しました',
        variant: 'destructive',
      });
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      value={title}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setTitle(e.target.value);
                      }}
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
                      value={description}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setDescription(e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <label>優先度</label>
              <PrioritySelect
                value={form.watch('priority')}
                onValueChange={(value) => {
                  console.log('Priority changed to:', value);
                  form.setValue('priority', value);
                }}
                allowClear
              />
            </div>
            <div className="flex items-center gap-2">
              <DueDatePicker
                dueDate={dueDate}
                setDueDate={setDueDate}
                variant="icon"
                className="flex-none"
              />
            </div>
            <div className="space-y-2">
              <FormLabel>タグ</FormLabel>
              <TagSelect
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                variant="icon"
                className="flex-none"
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
