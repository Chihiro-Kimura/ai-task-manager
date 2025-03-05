import { type ReactElement } from 'react';

import { AIProviderSettings } from '@/components/(settings)/AIProviderSettings';
import { GeneralAISettings } from '@/components/(settings)/GeneralAISettings';

export default function SettingsPage(): ReactElement {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold text-zinc-100 mb-6">設定</h1>
      <div className="grid grid-cols-1 gap-6">
        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-4">AI設定</h2>
          <div className="space-y-6">
            <GeneralAISettings />
            <AIProviderSettings />
          </div>
        </section>
      </div>
    </div>
  );
}
