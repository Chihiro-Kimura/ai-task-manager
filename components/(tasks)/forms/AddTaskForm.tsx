'use client';

import { Plus, X } from 'lucide-react';
import { type ReactElement } from 'react';
import { useState } from 'react';

import TagSelect from '@/components/(common)/forms/TagSelect';
import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import PrioritySelect from '@/components/(tasks)/filters/PrioritySelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskInput } from '@/lib/ai/types';
import { Priority, Tag } from '@/types/common';

interface AddTaskFormProps {
  onSubmit: (task: TaskInput & {
    status: string;
    task_order: number;
    category?: string;
    due_date: string | null;
  }) => void;
  onCancel: () => void;
  category?: string;
}

export default function AddTaskForm({
  onSubmit,
  onCancel,
  category,
}: AddTaskFormProps): ReactElement {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  
  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setPriority(null);
    setDueDate(undefined);
    setSelectedTags([]);
  };

  const handleSubmit = (): void => {
    if (!title) return;

    onSubmit({
      title,
      description,
      priority,
      tags: selectedTags,
      status: 'todo',
      task_order: 0,
      category,
      due_date: dueDate?.toISOString() || null,
    });
    resetForm();
  };

  const handleCancel = (): void => {
    resetForm();
    onCancel();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">新規タスク</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="text-zinc-400 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <Input
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="説明"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex items-center gap-2">
          <PrioritySelect
            value={priority}
            onValueChange={setPriority}
            className="flex-none"
          />
          <DueDatePicker
            dueDate={dueDate}
            setDueDate={setDueDate}
            variant="icon"
            className="flex-none"
          />
          <TagSelect
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            variant="icon"
            className="flex-none"
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            追加
          </Button>
        </div>
      </div>
    </div>
  );
}
