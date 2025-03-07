import { MoreHorizontal, Pencil, Trash2, Wand2 } from 'lucide-react';
import { type ReactElement } from 'react';

import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import { PrioritySelect } from '@/components/(tasks)/filters/PrioritySelect';
import { StatusSelect } from '@/components/(tasks)/filters/StatusSelect';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTaskApi } from '@/hooks/use-task-api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/styles';
import { useTaskStore } from '@/store/taskStore';
import { Priority } from '@/types/common';
import { TaskWithExtras } from '@/types/task';
import { type TaskStatus } from '@/types/task/status';

interface TaskHeaderProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onAIClick: () => void;
}

const CATEGORY_CONFIG = {
  inbox: {
    label: '受信箱',
    className: 'bg-blue-500/10 text-blue-500'
  },
  doing: {
    label: '進行中',
    className: 'bg-yellow-500/10 text-yellow-500'
  },
  todo: {
    label: '予定',
    className: 'bg-emerald-500/10 text-emerald-500'
  }
} as const;

export function TaskHeader({
  task,
  onMutate,
  onEdit,
  onDelete,
  onAIClick,
}: TaskHeaderProps): ReactElement {
  const { toast } = useToast();
  const { updateTask } = useTaskApi(task.id, {
    onSuccess: () => void onMutate(),
  });
  const viewMode = useTaskStore((state) => state.viewMode);

  const handleStatusChange = async (status: TaskStatus): Promise<void> => {
    try {
      await updateTask({ status });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: 'エラー',
        description: 'ステータスの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handlePriorityChange = async (priority: Priority | null): Promise<void> => {
    try {
      await updateTask({ priority });
    } catch (error) {
      console.error('Failed to update task priority:', error);
      toast({
        title: 'エラー',
        description: '優先度の更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDueDateChange = async (date: Date | undefined): Promise<void> => {
    try {
      await updateTask({ due_date: date?.toISOString() || null });
    } catch (error) {
      console.error('Failed to update task due date:', error);
      toast({
        title: 'エラー',
        description: '期日の更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const categoryConfig = CATEGORY_CONFIG[task.category as keyof typeof CATEGORY_CONFIG];

  return (
    <div className="space-y-2 p-4">
      {/* タイトル行 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <StatusSelect
            value={task.status as TaskStatus}
            onValueChange={handleStatusChange}
            variant="icon"
            noBorder
          />
          {viewMode === 'list' && (
            <span className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              categoryConfig.className
            )}>
              {categoryConfig.label}
            </span>
          )}
          <h3 className="font-medium text-sm text-zinc-200 truncate">
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onAIClick}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-300"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void onDelete()}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* メタデータ行 */}
      <div className="flex items-center gap-2">
        <PrioritySelect
          value={task.priority}
          onValueChange={handlePriorityChange}
          variant="icon"
          noBorder
          allowClear
          className="text-zinc-400 hover:text-zinc-300"
        />
        <DueDatePicker
          dueDate={task.due_date ? new Date(task.due_date) : undefined}
          setDueDate={handleDueDateChange}
          variant="icon"
          className="text-zinc-400 hover:text-zinc-300"
        />
      </div>
    </div>
  );
}