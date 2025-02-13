'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
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
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('✅ タスクが追加されました！');
        setTitle('');
        setDescription('');
      } else {
        setMessage(`❌ エラー: ${data.error || 'タスク追加に失敗しました'}`);
      }
    } catch (error) {
      console.error('APIリクエストエラー:', error);
      setMessage('❌ エラー: ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
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
        onClick={handleSubmit}
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
  );
}
