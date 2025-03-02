'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

import LoadingState from '@/components/LoadingState';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/auth/signin' });
  };

  if (isLoading) {
    return <LoadingState message="ログアウト中..." fullHeight={false} />;
  }

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
    >
      <LogOut className="mr-2 h-4 w-4" />
      ログアウト
    </Button>
  );
}
