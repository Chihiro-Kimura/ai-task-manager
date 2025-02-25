'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'AccessDenied':
        return 'アクセスが拒否されました。再度ログインをお試しください。';
      case 'Configuration':
        return '認証の設定に問題があります。';
      default:
        return 'エラーが発生しました。';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950 p-6">
        <h1 className="mb-4 text-2xl font-bold text-red-500 text-center">
          認証エラー
        </h1>
        <p className="text-zinc-400 text-center mb-6">
          {getErrorMessage(error || '')}
        </p>
        <Button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          variant="outline"
          className="w-full border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
        >
          ログインページに戻る
        </Button>
      </Card>
    </div>
  );
}
