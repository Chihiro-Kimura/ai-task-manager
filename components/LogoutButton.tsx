import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      variant="ghost"
      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
    >
      <LogOut className="mr-2 h-4 w-4" />
      ログアウト
    </Button>
  );
}
