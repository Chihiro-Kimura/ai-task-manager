'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import LoadingState from '@/components/(common)/loading/LoadingState';

export default function SignIn() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingState message="認証状態を確認中..." />;
  }

  if (session) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950">
        <CardHeader className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-center text-zinc-100">
            ログイン
          </h2>
          <p className="text-sm text-zinc-400 text-center">
            アカウントにサインインして始めましょう
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            variant="outline"
            className="w-full border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
          >
            <Image
              src="https://authjs.dev/img/providers/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Googleでログイン
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-zinc-500 text-center w-full">
            ※ログインすることで、利用規約とプライバシーポリシーに同意したことになります。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
