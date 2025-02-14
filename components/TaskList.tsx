import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// フェッチャー関数
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TaskList() {
  const { data: tasks, error, isLoading } = useSWR('/api/tasks', fetcher);
  const [message, setMessage] = useState('');

  if (isLoading) return <p>🌀 読み込み中...</p>;
  if (error) return <p>❌ エラーが発生しました</p>;
  if (!tasks || tasks.length === 0) return <p>📭 タスクがありません</p>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🗂️ タスク一覧</h2>
      <ul className="space-y-2">
        {tasks.map((task: any) => (
          <li key={task.id} className="p-2 border rounded-md">
            <strong>{task.title}</strong>
            <p className="text-sm text-gray-500">
              {task.description || '詳細なし'}
            </p>
            <p className="text-xs text-gray-400">
              作成日: {new Date(task.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      {message && <p className="mt-2 text-sm text-green-500">{message}</p>}
    </div>
  );
}
