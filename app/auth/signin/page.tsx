'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import LoadingState from '@/components/(common)/loading/LoadingState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export default function SignIn(): JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace('/tasks');
    }
  }, [session, router]);

  if (status === 'loading') {
    return <LoadingState message="認証状態を確認中..." />;
  }

  const handleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/tasks',
      });
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

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
            onClick={handleSignIn}
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
