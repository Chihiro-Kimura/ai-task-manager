'use client';

import { type ReactElement, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAIStore } from '@/store/aiStore';

export function AISettings(): ReactElement {
  const { settings, updateSettings } = useAIStore();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkApiKey = async (): Promise<void> => {
      try {
        const response = await fetch('/api/ai/config');
        const { apiKey } = await response.json();
        
        if (apiKey && !settings.apiKey) {
          updateSettings({
            apiKey,
            isEnabled: true
          });
          toast({
            title: 'APIキーを設定しました',
            description: 'AI機能が利用可能です',
          });
        }
      } catch (error) {
        console.error('Failed to check API key:', error);
      }
    };

    checkApiKey();
  }, []);

  const handleToggleAI = (checked: boolean): void => {
    updateSettings({ isEnabled: checked });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">AI機能</h3>
          <p className="text-sm text-muted-foreground">
            AI機能の有効/無効を切り替えます
          </p>
        </div>
        <Switch
          checked={settings.isEnabled}
          onCheckedChange={handleToggleAI}
          disabled={!settings.apiKey}
        />
      </div>
      
      {process.env.NODE_ENV === 'production' && (
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="APIキーを入力"
            value={settings.apiKey || ''}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
