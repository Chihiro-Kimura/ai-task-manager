// src/components/TaskList.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import EditTaskForm from './EditTaskForm';
import { useSession } from 'next-auth/react';
import { ListTodo, Pencil, Trash2 } from 'lucide-react';
import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TaskList() {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<'priority' | 'createdAt'>('priority');
  const [statusFilter, setStatusFilter] = useState<'all' | '未完了' | '完了'>(
    'all'
  );

  // データフェッチとフィルタリングを分離
  const {
    data: rawTasks,
    error,
    isLoading,
    mutate: mutateTasks,
  } = useSWR(
    session?.user?.id ? `/api/tasks` : null,
    async (url) => {
      const res = await fetch(url, {
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      });
      return res.json();
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );

  // フィルタリングとソートをメモ化
  const tasks = useMemo(() => {
    if (!rawTasks) return [];

    let filteredData = [...rawTasks];

    // ステータスフィルタリング
    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(
        (task) => task.status === statusFilter
      );
    }

    // 優先度でソート
    if (sortBy === 'priority') {
      filteredData.sort((a, b) => {
        const priorityOrder = { 高: 0, 中: 1, 低: 2 };
        return (
          (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
        );
      });
    } else {
      // createdAtでソート
      filteredData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filteredData;
  }, [rawTasks, statusFilter, sortBy]);

  // デバッグ用のログ
  useEffect(() => {
    if (rawTasks) {
      console.log('Raw tasks:', rawTasks);
      console.log('Filtered and sorted tasks:', tasks);
    }
  }, [rawTasks, tasks]);

  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState(null);

  // タスク削除ハンドラー
  const handleDeleteTask = async (taskId: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': session.user.id,
        },
      });

      const data = await res.json();

      if (res.ok) {
        await mutateTasks();
        toast({
          title: 'タスク削除',
          description: 'タスクを削除しました',
          icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
        });
      } else {
        toast({
          title: 'エラー',
          description: data.error || 'タスク削除に失敗しました',
          variant: 'destructive',
          icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '通信エラーが発生しました',
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  // タスクの状態を切り替える関数
  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === '完了' ? '未完了' : '完了';
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('ステータスの更新に失敗しました');
      }

      await mutateTasks(); // データを再取得

      toast({
        title: 'ステータス更新',
        description: `タスクを${newStatus}に変更しました`,
        icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'エラー',
        description: 'ステータスの更新に失敗しました',
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
        <div className="text-zinc-400 flex items-center gap-2 justify-center">
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
        <p className="text-zinc-400 text-center">エラーが発生しました</p>
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
        <p className="text-zinc-400 text-center">タスクがありません</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-zinc-100">
        <ListTodo className="h-5 w-5" />
        タスク一覧
      </h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-zinc-400 mr-2">
            並び順 :
          </label>
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as 'priority' | 'createdAt')
            }
          >
            <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-colors [&_span]:text-slate-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem
                value="priority"
                className="text-slate-400 hover:text-slate-100 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-slate-100"
              >
                優先度順
              </SelectItem>
              <SelectItem
                value="createdAt"
                className="text-slate-400 hover:text-slate-100 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-slate-100"
              >
                追加順
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400 mr-2">
            ステータス :
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as 'all' | '未完了' | '完了')
            }
          >
            <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-colors [&_span]:text-slate-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem
                value="all"
                className="text-slate-400 hover:text-slate-100 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-slate-100"
              >
                すべて
              </SelectItem>
              <SelectItem
                value="未完了"
                className="text-slate-400 hover:text-slate-100 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-slate-100"
              >
                未完了
              </SelectItem>
              <SelectItem
                value="完了"
                className="text-slate-400 hover:text-slate-100 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-slate-100"
              >
                完了
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="space-y-3">
        {tasks.map(({ id, title, description, priority, status }) => (
          <li
            key={id}
            className={`p-4 border border-zinc-800 bg-zinc-900/50 rounded-lg flex justify-between items-center hover:bg-zinc-900 transition-colors ${
              status === '完了' ? 'opacity-60' : ''
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleToggleStatus(id, status)}
                  variant="ghost"
                  size="sm"
                  className={`hover:bg-zinc-800 ${
                    status === '完了'
                      ? 'text-green-500 hover:text-green-400'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  {status === '完了' ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-current rounded-full" />
                  )}
                </Button>
                <strong
                  className={`text-slate-100 font-semibold ${
                    status === '完了' ? 'line-through' : ''
                  }`}
                >
                  {title}
                </strong>
              </div>
              <p className="text-sm text-slate-400">
                {description || '詳細なし'}
              </p>
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-400">優先度 : </span>
                <span
                  className={`ml-1 ${
                    priority === '高'
                      ? 'text-rose-500 font-semibold'
                      : priority === '中'
                      ? 'text-amber-500 font-medium'
                      : priority === '低'
                      ? 'text-emerald-500'
                      : 'text-zinc-400'
                  }`}
                >
                  {priority || '未設定'}
                </span>
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setEditingTask({ id, title, description, priority })
                }
                variant="ghost"
                size="sm"
                className="hover:bg-blue-900/20 hover:text-blue-400 text-zinc-400"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDeleteTask(id)}
                variant="ghost"
                size="sm"
                className="hover:bg-red-900/20 hover:text-red-400 text-zinc-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {editingTask && (
        <EditTaskForm
          taskId={editingTask.id}
          currentTitle={editingTask.title}
          currentDescription={editingTask.description}
          currentPriority={editingTask.priority}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
