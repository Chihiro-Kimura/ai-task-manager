import { Metadata } from 'next';
import { type ReactNode } from 'react';

import { NotificationSettings } from '@/components/(settings)/NotificationSettings';
import { ThemeSettings } from '@/components/(settings)/ThemeSettings';

export const metadata: Metadata = {
  title: 'アプリケーション設定 | AI Task Manager',
  description: 'アプリケーションの一般設定を管理します。',
};

export default function GeneralSettingsPage(): ReactNode {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">表示設定</h3>
        <p className="text-sm text-muted-foreground">
          アプリケーションの表示に関する設定を管理します。
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <ThemeSettings />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold">通知設定</h3>
        <p className="text-sm text-muted-foreground">
          通知に関する設定を管理します。
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <NotificationSettings />
      </div>
    </div>
  );
} 