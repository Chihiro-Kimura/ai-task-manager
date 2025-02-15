'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">認証エラー</h1>
        <p className="text-gray-600">
          認証中にエラーが発生しました。
          <br />
          しばらくしてから再度お試しください。
        </p>
        <div className="text-sm text-gray-500">
          {error && `エラー: ${error}`}
        </div>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
