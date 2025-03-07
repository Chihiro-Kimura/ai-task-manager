'use client';

import { type ReactElement } from 'react';

import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TaskWithExtras } from '@/types/task';

import { type FormValues, EditTaskForm } from './EditTaskForm';

interface TaskEditDialogProps {
  task: TaskWithExtras;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function TaskEditDialog({
  task,
  isOpen,
  onOpenChange,
  onSubmit,
}: TaskEditDialogProps): ReactElement {
  const { toast } = useToast();

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      // APIに送信するデータを正規化
      const apiValues = {
        ...values,
        tags: values.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: typeof tag.color === 'string' ? tag.color : null,
          userId: tag.userId
        }))
      };

      console.log('Submitting API values:', apiValues);
      await onSubmit(apiValues as FormValues);
      onOpenChange(false);
      toast({
        title: '更新完了',
        description: 'タスクを更新しました',
      });
    } catch (error) {
      console.error('Error in TaskEditDialog submit:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'タスクの更新に失敗しました';
      
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <EditTaskForm
          task={task}
          onClose={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      )}
    </Dialog>
  );
}