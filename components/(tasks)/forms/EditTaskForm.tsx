'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactElement } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import TagSelect from '@/components/(common)/forms/tag-select';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTagManagement } from '@/hooks/use-tag-management';
import { Tag } from '@/types/common';
import { TaskWithExtras } from '@/types/task';
import { TASK_STATUS, TaskStatus, STATUS_MAPPING } from '@/types/task/status';

import DueDatePicker from '../filters/DueDatePicker';
import { PrioritySelect } from '../filters/PrioritySelect';
import { StatusSelect } from '../filters/StatusSelect';

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
  status: z.enum([
    TASK_STATUS.TODO,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.DONE,
    TASK_STATUS.PENDING
  ]).default(TASK_STATUS.TODO),
  category: z.enum(['inbox', 'doing', 'todo']).default('inbox'),
  dueDate: z.date({
    errorMap: () => ({ message: '有効な日付を選択してください' })
  }).nullable().transform(v => v === null ? undefined : v),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().nullable().transform(v => {
        if (typeof v === 'string') {
          try {
            JSON.parse(v);
            return v;
          } catch {
            return v;
          }
        }
        return null;
      }),
      userId: z.string(),
      createdAt: z.union([z.string(), z.date(), z.instanceof(Date)])
        .transform(v => v instanceof Date ? v : new Date(v))
    })
  ).default([]),
});

export type FormValues = z.infer<typeof formSchema>;

interface EditTaskFormProps {
  task: TaskWithExtras;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function EditTaskForm({ task, onClose, onSubmit }: EditTaskFormProps): ReactElement {
  // ステータスの正規化
  const normalizeStatus = (status: string | null | undefined): TaskStatus => {
    if (!status) return TASK_STATUS.TODO;
    // ステータスが正しい形式かチェック
    if (Object.values(TASK_STATUS).includes(status as TaskStatus)) {
      return status as TaskStatus;
    }
    // レガシーステータスの変換を試みる
    if (status in STATUS_MAPPING) {
      return STATUS_MAPPING[status];
    }
    // どれにも該当しない場合はデフォルト値
    return TASK_STATUS.TODO;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      status: normalizeStatus(task.status),
      priority: task.priority || null,
      category: (task.category || 'inbox') as 'inbox' | 'doing' | 'todo',
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      tags: task.tags?.map(tag => ({
        ...tag,
        createdAt: new Date(tag.createdAt),
        color: typeof tag.color === 'string' ? tag.color : null
      })) || [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldUnregister: false,
    criteriaMode: 'all'
  });

  // フォームの初期値が設定された後に一度バリデーションを実行
  useEffect(() => {
    form.trigger();
  }, [form]);

  const { formState: { errors, isSubmitting, isValid }, handleSubmit } = form;

  // バリデーションの詳細をログ出力
  useEffect(() => {
    console.log('Form validation details:', {
      errors,
      isValid,
      values: form.getValues(),
      defaultValues: form.formState.defaultValues,
      dirtyFields: form.formState.dirtyFields,
      touchedFields: form.formState.touchedFields
    });
  }, [form, errors, isValid]);

  const { tags: availableTags, isLoading: isTagsLoading } = useTagManagement({
    id: task.id,
    type: 'task',
    initialTags: task.tags,
  });

  // タグデータの正規化
  const normalizeTag = (tag: Tag): Tag => ({
    ...tag,
    createdAt: tag.createdAt instanceof Date ? tag.createdAt : new Date(tag.createdAt),
    color: typeof tag.color === 'string' ? tag.color : null,
    userId: tag.userId || ''
  });

  const onTagsChange = (tags: Tag[]): void => {
    const normalizedTags = tags.map(normalizeTag);
    console.log('Setting normalized tags:', normalizedTags);
    form.setValue('tags', normalizedTags, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  useEffect(() => {
    if (task.tags) {
      const normalizedTags = task.tags.map(normalizeTag);
      console.log('Initial normalized tags:', normalizedTags);
      form.setValue('tags', normalizedTags, { 
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false 
      });
    }
  }, [task.tags, form]);

  const handleFormSubmit = async (values: FormValues): Promise<void> => {
    try {
      console.log('Submitting form with values:', values);
      await onSubmit(values);
    } catch (error) {
      console.error('EditTaskForm submit error:', error);
      throw error;
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>タスクの編集</DialogTitle>
        <DialogDescription>
          タスクの詳細を編集します。変更後、保存ボタンをクリックしてください。
        </DialogDescription>
      </DialogHeader>
      <form 
        onSubmit={handleSubmit(handleFormSubmit)} 
        className="space-y-4"
      >
        <div className="space-y-2">
          <Input
            placeholder="タイトル"
            {...form.register('title')}
            aria-invalid={errors.title ? 'true' : 'false'}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder="説明"
            {...form.register('description')}
            aria-invalid={errors.description ? 'true' : 'false'}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatusSelect
            value={form.watch('status')}
            onValueChange={(value) => form.setValue('status', value, { shouldValidate: true })}
          />
          <PrioritySelect
            value={form.watch('priority')}
            onValueChange={(value) => form.setValue('priority', value, { shouldValidate: true })}
            allowClear
          />
        </div>
        <DueDatePicker
          dueDate={form.watch('dueDate')}
          setDueDate={(date) => form.setValue('dueDate', date, { shouldValidate: true })}
        />
        <TagSelect
          id={task.id}
          type="task"
          selectedTags={form.watch('tags')}
          onTagsChange={onTagsChange}
          initialTags={availableTags}
          isLoading={isTagsLoading}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !isValid}
          >
            保存
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
