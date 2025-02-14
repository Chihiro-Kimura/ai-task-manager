// src/components/AddTaskForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mutate } from 'swr';

export default function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // タスク追加ハンドラー
  const handleAddTask = async () => {
    if (!title) {
      toast({
        title: '❌ エラー',
        description: 'タイトルは必須です',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          userId: 'guest', // 仮のユーザーID（実際は認証から取得）
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: '✅ 成功', description: 'タスクが追加されました！' });
        setTitle('');
        setDescription('');
        mutate('/api/tasks'); // 一覧を即時更新
      } else {
        toast({
          title: '❌ エラー',
          description: data.error || 'タスク追加に失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ エラー',
        description: 'ネットワークエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">📝 タスク追加</h2>
      <Input
        placeholder="タイトルを入力"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="詳細を入力"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2"
      />
      <Button
        onClick={handleAddTask}
        disabled={isLoading}
        className="mt-4 w-full bg-green-500 text-white"
      >
        {isLoading ? '追加中...' : 'タスクを追加'}
      </Button>
    </div>
  );
}
