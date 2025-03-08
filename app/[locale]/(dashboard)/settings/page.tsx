import { Metadata } from 'next';
import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: '設定 | AI Task Manager',
  description: 'アプリケーションの設定を管理します。',
};

export default function SettingsPage(): ReactNode {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">最近の設定</h3>
          <p className="text-sm text-muted-foreground">
            最近変更された設定はありません。
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">クイックアクション</h3>
          <p className="text-sm text-muted-foreground">
            左のメニューから設定項目を選択してください。
          </p>
        </div>
      </div>
    </div>
  );
} 