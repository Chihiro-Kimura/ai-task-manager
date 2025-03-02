'use client';

import { ListTodo, Settings, Sparkles, StickyNote, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactElement, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: ReactElement;
}

const navItems: NavItem[] = [
  {
    title: 'タスク管理',
    href: '/tasks',
    icon: <ListTodo className="h-4 w-4" />,
  },
  {
    title: 'メモ帳',
    href: '/notes',
    icon: <StickyNote className="h-4 w-4" />,
  },
  {
    title: 'タグ管理',
    href: '/tags',
    icon: <Tag className="h-4 w-4" />,
  },
  {
    title: 'AI設定',
    href: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

export function Sidebar(): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col border-r border-zinc-800 bg-zinc-950 duration-300',
        isCollapsed ? 'w-12' : 'w-56'
      )}
    >
      <div className="flex h-14 items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-full w-full flex items-center justify-center hover:bg-zinc-900/50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className={cn('space-y-2', isCollapsed ? 'px-2' : 'p-4')}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'default' : 'ghost'}
              className={cn(
                'w-full',
                isCollapsed ? 'justify-center px-0' : 'justify-start',
                pathname === item.href && 'bg-primary text-primary-foreground'
              )}
              asChild
            >
              <Link href={item.href}>
                <div
                  className={cn(
                    'flex items-center w-full',
                    isCollapsed ? 'justify-center' : 'justify-start'
                  )}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-2">{item.title}</span>}
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
