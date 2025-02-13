'use client';
import { Button } from '@/components/ui/button';

export default function Home() {
  const handleClick = () => {
    alert('クリックされました！');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">AIタスク管理アプリ</h1>
      <Button onClick={handleClick}>タスクを追加</Button>
    </main>
  );
}
