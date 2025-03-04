'use client';

import { type ReactElement, useState } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TaskWithExtras } from '@/types/task';

import EditTaskForm from '../forms/EditTaskForm';

import AITaskAnalysis from './features/ai/AITaskAnalysis';
import { TaskContent } from './features/TaskContent';
import { TaskHeader } from './features/TaskHeader';

interface TaskItemProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
}

export default function TaskItem({
  task,
  onMutate,
}: TaskItemProps): ReactElement {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const { toast } = useToast();

  const handleMutation = async (): Promise<void> => {
    try {
      await onMutate();
    } catch {
      toast({
        title: 'エラー',
        description: '更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });
      await handleMutation();
      toast({
        title: '削除しました',
        description: 'タスクを削除しました',
      });
    } catch {
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="bg-slate-900 rounded-lg shadow hover:shadow-md transition-shadow">
        <TaskHeader
          task={task}
          onMutate={handleMutation}
          onEdit={() => setIsEditModalOpen(true)}
          onDelete={handleDelete}
          onAIClick={() => setIsAIOpen(true)}
        />
        <TaskContent task={task} onMutate={handleMutation} />
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogTitle>タスクの編集</DialogTitle>
          <DialogDescription>
            タスクの内容を編集できます。
          </DialogDescription>
          <EditTaskForm
            task={task}
            onSuccess={handleMutation}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
        <DialogContent>
          <DialogTitle>AI分析</DialogTitle>
          <DialogDescription>
            AIによるタスクの分析結果を表示します。
          </DialogDescription>
          <AITaskAnalysis
            task={task}
            onMutate={handleMutation}
            onClose={() => setIsAIOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
