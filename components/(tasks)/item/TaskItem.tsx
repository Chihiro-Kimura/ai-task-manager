'use client';

import { type ReactElement, useState } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTaskApi } from '@/hooks/use-task-api';
import { TaskWithExtras } from '@/types/task';

import { EditTaskForm } from '../forms/EditTaskForm';

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
  const { updateTask, deleteTask } = useTaskApi(task.id, {
    onSuccess: () => void onMutate(),
  });

  const handleDelete = async (): Promise<void> => {
    await deleteTask();
  };

  return (
    <>
      <div className="bg-slate-900 rounded-lg shadow hover:shadow-md transition-shadow">
        <TaskHeader
          task={task}
          onMutate={onMutate}
          onEdit={() => setIsEditModalOpen(true)}
          onDelete={handleDelete}
          onAIClick={() => setIsAIOpen(true)}
        />
        <TaskContent task={task} onMutate={onMutate} />
      </div>

      {isEditModalOpen && (
        <EditTaskForm
          task={task}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={async (values) => {
            const { dueDate, tags: selectedTags, ...rest } = values;
            
            await updateTask({
              ...rest,
              due_date: dueDate?.toISOString() ?? null,
              tags: selectedTags.map(tag => ({ id: tag.id })),
            });
            setIsEditModalOpen(false);
          }}
        />
      )}

      <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
        <DialogContent>
          <DialogTitle>AI分析</DialogTitle>
          <DialogDescription>
            AIによるタスクの分析結果を表示します。
          </DialogDescription>
          <AITaskAnalysis
            task={task}
            onMutate={onMutate}
            onClose={() => setIsAIOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
