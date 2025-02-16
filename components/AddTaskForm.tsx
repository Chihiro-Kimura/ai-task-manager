// src/components/AddTaskForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mutate } from 'swr';
import { useSession } from 'next-auth/react';
import { PlusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AddTaskFormProps = {
  sortBy: 'priority' | 'createdAt';
};

export default function AddTaskForm({ sortBy }: AddTaskFormProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('中');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // タスク追加ハンドラー
  const handleAddTask = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'エラー',
        description: '認証情報が見つかりません',
        variant: 'destructive',
      });
      return;
    }

    if (!title) {
      toast({
        title: 'エラー',
        description: 'タイトルは必須です',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: '追加成功',
          description: 'タスクが追加されました！',
          variant: 'default',
        });
        setTitle('');
        setDescription('');
        setPriority('中');
        mutate(`/api/tasks?sortBy=${sortBy}`);
      } else {
        toast({
          title: 'エラー',
          description: data.error || 'タスク追加に失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ネットワークエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
        <div className="text-zinc-400 flex items-center gap-2 justify-center">
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
          <span>追加中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-zinc-100">新規タスク</h2>
      <Input
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-zinc-950 border-zinc-800 text-slate-100 placeholder:text-slate-400"
      />
      <Textarea
        placeholder="詳細を入力"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2 bg-zinc-950 border-zinc-800 text-slate-100 placeholder:text-slate-400"
      />
      <div className="text-zinc-400 mt-2 block">優先度 : </div>
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
      <Button
        onClick={handleAddTask}
        disabled={isLoading}
        className="mt-4 w-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {isLoading ? '追加中...' : 'タスクを追加'}
      </Button>
    </div>
  );
}
