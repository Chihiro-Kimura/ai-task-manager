'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';

import { EditButton, DeleteButton } from '@/components/ui/action-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { geminiProvider } from '@/lib/ai/gemini';
import { transformersProvider } from '@/lib/ai/transformers';
import { useAIStore } from '@/store/aiStore';

export function AISettings(): ReactElement {
  const { settings, updateSettings } = useAIStore();
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const { toast } = useToast();

  const handleProviderChange = (value: string): void => {
    updateSettings({
      provider: value as 'gemini' | 'transformers',
      apiKey: value === 'transformers' ? undefined : apiKey,
    });
  };

  const handleSaveApiKey = (): void => {
    if (!apiKey.trim() && settings.provider === 'gemini') {
      toast({
        title: 'APIキーを入力してください',
        variant: 'destructive',
      });
      return;
    }

    updateSettings({
      apiKey: apiKey.trim(),
    });

    toast({
      title: 'APIキーを保存しました',
    });
  };

  const handleDeleteApiKey = (): void => {
    setApiKey('');
    updateSettings({
      apiKey: undefined,
    });

    toast({
      title: 'APIキーを削除しました',
    });
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-100">AI設定</CardTitle>
        <CardDescription>
          タグ提案と優先度分析に使用するAIプロバイダーを設定します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="provider" className="text-zinc-100">
            AIプロバイダー
          </Label>
          <Select
            value={settings.provider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger
              id="provider"
              className="bg-zinc-900 border-zinc-800"
            >
              <SelectValue placeholder="プロバイダーを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transformers">
                {transformersProvider.name}
                <span className="text-xs text-zinc-400 ml-2">
                  {transformersProvider.description}
                </span>
              </SelectItem>
              <SelectItem value="gemini">
                {geminiProvider.name}
                <span className="text-xs text-zinc-400 ml-2">
                  {geminiProvider.description}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-400">
            {settings.provider === 'transformers'
              ? 'ローカルで動作する軽量な日本語AIモデルです。APIキーは不要です。'
              : 'Googleが提供する高性能なAIモデルです。APIキーが必要です。'}
          </p>
        </div>

        {settings.provider === 'gemini' && (
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-zinc-100">
              Gemini API Key
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-zinc-900 border-zinc-800"
                placeholder="sk-..."
              />
              {(!settings.apiKey || apiKey !== settings.apiKey) && (
                <EditButton className="h-9 w-9" onClick={handleSaveApiKey}>
                  <Pencil className="h-4 w-4" />
                </EditButton>
              )}
              {settings.apiKey && (
                <DeleteButton className="h-9 w-9" onClick={handleDeleteApiKey}>
                  <Trash2 className="h-4 w-4" />
                </DeleteButton>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Google AI StudioでAPIキーを取得できます
            </p>
          </div>
        )}

        <div className="rounded-lg bg-zinc-900 p-4 text-sm text-zinc-400">
          <h4 className="font-medium text-zinc-300 mb-2">現在の設定</h4>
          <p>
            プロバイダー:{' '}
            {settings.provider === 'gemini'
              ? geminiProvider.name
              : transformersProvider.name}
          </p>
          <p>
            ステータス:{' '}
            {settings.provider === 'gemini' && !settings.apiKey ? (
              <span className="text-yellow-500">APIキーが未設定です</span>
            ) : (
              <span className="text-emerald-500">使用可能</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
