'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function SignIn() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            ログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            アカウントにサインインして始めましょう
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-2 text-gray-700 shadow-md hover:bg-gray-50"
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
            Googleでログイン
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          ※ログインすることで、利用規約とプライバシーポリシーに同意したことになります。
        </div>
      </div>
    </div>
  );
}
