'use client';

import { type ReactElement } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAIStore } from '@/store/aiStore';

export function GeneralAISettings(): ReactElement {
  const { isEnabled, updateSettings } = useAIStore();
  const { toast } = useToast();

  const handleToggleAI = (checked: boolean): void => {
    updateSettings({ isEnabled: checked });
    toast({
      title: checked ? 'AI機能を有効にしました' : 'AI機能を無効にしました',
      description: checked 
        ? 'タスクの分析や提案などのAI機能が利用可能になりました'
        : 'AI機能を無効化しました',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI機能の有効化</CardTitle>
        <CardDescription>
          AI機能の有効/無効を切り替えます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">AI機能を有効にする</h3>
            <p className="text-sm text-muted-foreground">
              タスクの分析、タグ提案、優先度分析などのAI機能を使用できます
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleAI}
          />
        </div>
      </CardContent>
    </Card>
  );
} 