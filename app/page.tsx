'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function Home() {
  const [response, setResponse] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ タスク問い合わせハンドラー
  const handleChat = async () => {
    setIsLoading(true);
    setResponse('');
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
      setResponse('❌ ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ タスク追加ハンドラー
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
    <main className="flex min-h-screen flex-col items-center justify-center">
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

      {/* タスク問い合わせボタン */}
      <div className="mt-8">
        <Button
          onClick={handleChat}
          className="bg-blue-500 text-white"
          disabled={isLoading}
        >
          {isLoading ? '問い合わせ中...' : 'タスク問い合わせ'}
        </Button>
      </div>

      {/* AIからの返答表示 */}
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow">
          <strong>AIの返答:</strong>
          <pre className="whitespace-pre-wrap text-sm">{response}</pre>
        </div>
      )}
    </main>
  );
}
