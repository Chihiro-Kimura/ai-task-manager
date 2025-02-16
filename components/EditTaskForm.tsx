'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface EditTaskFormProps {
  taskId: string;
  currentTitle: string;
  currentDescription?: string;
  currentPriority?: string;
  onClose: () => void;
}

export default function EditTaskForm({
  taskId,
  currentTitle,
  currentDescription = '',
  currentPriority = '',
  onClose,
}: EditTaskFormProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [priority, setPriority] = useState(currentPriority);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'エラー',
        description: '認証情報が見つかりません',
        variant: 'destructive',
      });
      return;
    }

    if (!priority) {
      toast({
        title: 'エラー',
        description: '優先度を選択してください',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // デバッグ用のログを追加
      console.log('Updating task with data:', { title, description, priority });

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
        body: JSON.stringify({ title, description, priority }),
      });

      const data = await res.json();
      // デバッグ用のログを追加
      console.log('Update response:', data);

      if (res.ok) {
        toast({
          title: '更新成功',
          description: 'タスクが更新されました！',
          variant: 'default',
        });
        mutate('/api/tasks');
        onClose();
      } else {
        toast({
          title: 'エラー',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: '通信エラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80">
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-zinc-100">タスクを編集</h2>
        <Input
          value={title ?? ''}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="mb-3 bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder:text-zinc-400"
        />
        <Textarea
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細"
          className="mb-4 bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder:text-zinc-400"
        />
        <div className="mb-4">
          <div className="text-zinc-400 mb-2">優先度 : </div>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-colors text-slate-100">
              <SelectValue>
                <span
                  className={
                    priority === '高'
                      ? 'text-rose-500'
                      : priority === '中'
                      ? 'text-amber-500'
                      : priority === '低'
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  }
                >
                  {priority}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem
                value="高"
                className="text-rose-500 hover:text-rose-400 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-rose-400"
              >
                高
              </SelectItem>
              <SelectItem
                value="中"
                className="text-amber-500 hover:text-amber-400 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-amber-400"
              >
                中
              </SelectItem>
              <SelectItem
                value="低"
                className="text-emerald-500 hover:text-emerald-400 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-emerald-400"
              >
                低
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
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
            className="hover:bg-blue-900/20 hover:text-blue-400 text-zinc-400"
          >
            {isLoading ? '更新中...' : '更新'}
          </Button>
        </div>
      </div>
    </div>
  );
}
