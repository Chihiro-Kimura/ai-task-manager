import { type ReactNode } from 'react';

import { SettingsNav } from '@/components/(common)/navigation/SettingsNav';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps): ReactNode {
  return (
    <div className="container py-6 space-y-6">
      <div className="grid grid-cols-[200px_1fr] gap-6">
        <aside className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">設定</h2>
            <p className="text-sm text-muted-foreground">
              アプリケーションの設定を管理します。
            </p>
          </div>
          <SettingsNav />
        </aside>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
} 