'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-500">認証エラー</h1>
      <p className="mt-2 text-zinc-400">{error || '認証に失敗しました'}</p>
    </div>
  );
}
