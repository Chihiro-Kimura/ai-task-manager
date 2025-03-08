import { Metadata } from 'next';
import { type ReactNode } from 'react';

import { AIProviderSettings } from '@/components/(settings)/AIProviderSettings';

export const metadata: Metadata = {
  title: 'AIモデル設定 | AI Task Manager',
  description: 'AIモデルの設定を管理します。',
};

export default function AISettingsPage(): ReactNode {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">AIプロバイダー設定</h3>
        <p className="text-sm text-muted-foreground">
          AIプロバイダーの選択とAPIキーの設定を行います。
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <AIProviderSettings />
      </div>
    </div>
  );
} 