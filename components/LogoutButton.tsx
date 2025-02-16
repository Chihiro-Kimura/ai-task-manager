'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/auth/signin' });
  };

  if (isLoading) {
    return (
      <div className="text-zinc-400 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
        <span>ログアウト中...</span>
      </div>
    );
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
