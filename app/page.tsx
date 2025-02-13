'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Home() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // APIリクエストハンドラー
  const handleChat = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '過去のタスクを教えて' }),
      });
      const data = await res.json();
      setResponse(data.response || 'エラーが発生しました');
    } catch (error) {
      console.error('APIリクエストエラー:', error);
      setResponse('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // タスク追加ハンドラー
  const handleAddTask = () => {
    alert('クリックされました！新しいタスクを追加する機能は近日公開予定です。');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">AIタスク管理アプリ</h1>

      <div className="flex gap-4 mb-6">
        <Button onClick={handleAddTask} className="bg-green-500 text-white">
          タスクを追加
        </Button>

        <Button
          onClick={handleChat}
          className="bg-blue-500 text-white"
          disabled={isLoading}
        >
          {isLoading ? '問い合わせ中...' : 'タスク問い合わせ'}
        </Button>
      </div>

      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow">
          <strong>AIの返答:</strong>
          <pre className="whitespace-pre-wrap text-sm">{response}</pre>
        </div>
      )}
    </main>
  );
}
