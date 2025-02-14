import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      variant="ghost"
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
    >
      <LogOut size={18} />
      ログアウト
    </Button>
  );
}
