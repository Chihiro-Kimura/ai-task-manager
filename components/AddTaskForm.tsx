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
import DueDatePicker from '@/components/DueDatePicker';

export default function AddTaskForm() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

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
      console.log('Sending task data:', { title, description, priority });

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
          status: '未完了',

          dueDate: dueDate?.toISOString(),
        }),
      });

      if (res.ok) {
        toast({
          title: '追加成功',
          description: 'タスクが追加されました！',
          variant: 'default',
        });
        setTitle('');
        setDescription('');

        setPriority('中');

        // グローバルにSWRのキャッシュを更新
        await mutate('/api/tasks');
      } else {
        toast({
          title: 'エラー',
          description: 'タスク追加に失敗しました',
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
    <div className="p-4 border border-zinc-800 bg-zinc-950 rounded-lg relative">
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
          <SelectValue placeholder="優先度を選択">
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
              {priority || '選択してください'}
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
      <DueDatePicker
        dueDate={dueDate}
        setDueDate={setDueDate}
        className="mt-4"
      />
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
