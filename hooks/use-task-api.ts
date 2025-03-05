import { useSWRConfig } from 'swr';

import { UpdateTaskRequest, TaskWithExtras } from '@/types/task';

import { useToast } from './use-toast';

interface UseTaskApiOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface TaskApi {
  updateTask: (data: UpdateTaskRequest) => Promise<TaskWithExtras>;
  deleteTask: () => Promise<void>;
}

export function useTaskApi(taskId: string, options: UseTaskApiOptions = {}): TaskApi {
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  const handleError = (error: unknown): never => {
    const message = error instanceof Error ? error.message : 'タスクの更新に失敗しました';
    toast({
      title: 'エラー',
      description: message,
      variant: 'destructive',
    });
    options.onError?.(new Error(message));
    throw new Error(message);
  };

  return {
    updateTask: async (data: UpdateTaskRequest): Promise<TaskWithExtras> => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('タスクの更新に失敗しました');
        }

        const updatedTask = await response.json();
        
        // SWRのキャッシュを更新
        await mutate(
          (key) => typeof key === 'string' && key.includes('/api/tasks'),
          undefined,
          { revalidate: true }
        );

        options.onSuccess?.();
        return updatedTask;
      } catch (error) {
        return handleError(error);
      }
    },

    deleteTask: async (): Promise<void> => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('タスクの削除に失敗しました');
        }

        // SWRのキャッシュを更新
        await mutate(
          (key) => typeof key === 'string' && key.includes('/api/tasks'),
          undefined,
          { revalidate: true }
        );

        toast({
          title: '削除しました',
          description: 'タスクを削除しました',
        });

        options.onSuccess?.();
      } catch (error) {
        handleError(error);
      }
    },
  };
} 