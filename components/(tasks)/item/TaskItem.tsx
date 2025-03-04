'use client';

import { type ReactElement, useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from '@/store/taskStore';
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
  const { tasks, setTasks } = useTaskStore();

  const handleMutation = async (): Promise<void> => {
    await onMutate();
  };

  const handleDelete = async (): Promise<void> => {
    try {
      // 楽観的更新
      setTasks(tasks.filter((t) => t.id !== task.id));

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // エラー時は状態を元に戻す
        setTasks(tasks);
        throw new Error('タスクの削除に失敗しました');
      }

      // サーバーとの同期
      await handleMutation();
      
      toast({
        title: '成功',
        description: 'タスクを削除しました',
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '不明なエラーが発生しました',
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
