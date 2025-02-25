import { type ReactElement } from 'react';

import { AISettings } from '@/components/(settings)/AISettings';

export default function SettingsPage(): ReactElement {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold text-zinc-100 mb-6">設定</h1>
      <div className="grid grid-cols-1 gap-6">
        <AISettings />
      </div>
    </div>
  );
}
