'use client';

import { Bot, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/styles';

const items = [
  {
    title: 'プロフィール',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'AIモデル',
    href: '/settings/ai',
    icon: Bot,
  },
  {
    title: 'アプリケーション',
    href: '/settings/general',
    icon: Settings,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
            pathname === item.href ? 'bg-accent' : 'transparent'
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
} 