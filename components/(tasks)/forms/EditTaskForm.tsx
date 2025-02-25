'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { mutate } from 'swr';

import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import PrioritySelect from '@/components/(tasks)/filters/PrioritySelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from '@/store/taskStore';

interface EditTaskFormProps {
  taskId: string;
  currentTitle: string;
  currentDescription: string | null;
  currentPriority: string | null;
  currentDueDate?: Date | null;
  onClose: () => void;
}

export default function EditTaskForm({
  taskId,
  currentTitle,
  currentDescription = null,
  currentPriority = null,
  currentDueDate = null,
  onClose,
}: EditTaskFormProps) {
  const { data: session } = useSession();
  const { setIsEditModalOpen } = useTaskStore();
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [priority, setPriority] = useState(currentPriority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    currentDueDate ? new Date(currentDueDate) : undefined
  );
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setIsEditModalOpen(false);
    onClose();
  };

  const handleUpdate = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'エラー',
        description: '認証情報が見つかりません',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        title,
        description,
        priority,
        due_date: dueDate?.toISOString(),
      };

      console.log('Updating task with data:', updateData);

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (response.ok) {
        toast({
          title: '更新成功',
          description: 'タスクが更新されました！',
          variant: 'default',
        });
        mutate('/api/tasks');
        handleClose();
      } else {
        toast({
          title: 'エラー',
          description: data.error,
          variant: 'destructive',
        });
      }
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
        <Input
          draggable="false"
          value={title ?? ''}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="mb-3 bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder:text-zinc-400 cursor-text"
        />
        <Textarea
          draggable="false"
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細"
          className="mb-4 bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder:text-zinc-400 cursor-text"
        />
        <div className="mb-4">
          <div className="text-zinc-400 mb-2">優先度 : </div>
          <PrioritySelect
            value={priority ?? undefined}
            onValueChange={setPriority}
          />
        </div>
        <DueDatePicker
          dueDate={dueDate}
          setDueDate={setDueDate}
          className="mb-4"
        />
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
            onClick={handleUpdate}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="hover:bg-emerald-900/20 hover:text-emerald-400 text-zinc-400"
          >
            {isLoading ? '更新中...' : '更新'}
          </Button>
        </div>
      </div>
    </div>
  );
}
