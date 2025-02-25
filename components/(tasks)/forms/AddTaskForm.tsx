'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import PrioritySelect from '@/components/(tasks)/filters/PrioritySelect';
import { toast } from '@/hooks/use-toast';

interface AddTaskFormProps {
  onSubmit: (task: {
    title: string;
    description: string;
    priority: string;
    status: string;
    task_order: number;
    category: string;
    due_date?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  category: string;
}

export default function AddTaskForm({
  onSubmit,
  onCancel,
  category,
}: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('');
    setDueDate(undefined);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!title) return;

    try {
      await onSubmit({
        title,
        description,
        priority,
        status: 'pending',
        task_order: 0,
        category,
        due_date: dueDate ? dueDate.toISOString() : null,
      });

      resetForm();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの追加に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleInputFocus = () => {
    setIsEditing(true);
  };

  return (
    <li className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
      <div className="flex justify-between items-start mb-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="タイトルを入力"
          className="bg-transparent border-none text-zinc-100 placeholder:text-zinc-400 p-0 h-auto text-sm focus-visible:ring-0"
          autoFocus
        />
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isEditing && (
        <>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="詳細を入力"
            className="bg-transparent border-none text-zinc-100 placeholder:text-zinc-400 p-0 text-xs min-h-[40px] focus-visible:ring-0"
          />

          <div className="mt-3 flex items-center gap-2">
            <PrioritySelect value={priority} onValueChange={setPriority} />

            <DueDatePicker
              dueDate={dueDate}
              setDueDate={setDueDate}
              variant="icon"
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={handleSubmit}
              disabled={!title}
              className={cn(
                'h-7 w-7 p-0',
                !title ? 'text-zinc-600' : 'text-zinc-400 hover:text-zinc-100'
              )}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
