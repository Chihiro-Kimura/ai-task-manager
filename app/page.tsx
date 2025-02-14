'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TaskList from '@/components/TaskList';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';

export default function Home() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // タスク追加ハンドラー
  const handleAddTask = async () => {
    if (!title) {
      setMessage('タイトルを入力してください');
      return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, userId: '1' }),
      });
      const data = res.ok ? await res.json() : null;
      if (res.ok) {
        setMessage('✅ タスクが追加されました！');
        setTitle('');
        setDescription('');
        // 🌀 useSWRのキャッシュを更新して即時反映
        mutate('/api/tasks');
      } else {
        setMessage(`❌ エラー: ${data?.error ?? 'タスク追加に失敗しました'}`);
      }
    } catch (error) {
      console.error('APIリクエストエラー:', error);
      setMessage('❌ エラー: ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">AIタスク管理アプリ</h1>

      {/* タスク追加フォーム */}
      <div className="flex flex-col gap-4 mb-6 p-4 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold">📝 タスク追加フォーム</h2>
        <Input
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="詳細を入力"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          onClick={handleAddTask}
          disabled={isLoading}
          className="bg-green-500 text-white"
        >
          {isLoading ? '追加中...' : 'タスクを追加'}
        </Button>
        {message && (
          <p
            className={`text-sm ${
              message.includes('✅') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* タスク一覧表示 */}
      <div className="w-full max-w-xl mt-8">
        <TaskList />
      </div>
    </main>
  );
}
