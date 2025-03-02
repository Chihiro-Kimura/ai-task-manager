'use client';

import { type ReactElement, useState } from 'react';

import { DeleteButton, EditButton } from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { geminiProvider } from '@/lib/ai/gemini';
import { useAIStore } from '@/store/aiStore';

export function AISettings(): ReactElement {
  const { settings, updateSettings } = useAIStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const { toast } = useToast();

  const handleSave = (): void => {
    try {
      if (apiKey) {
        geminiProvider.initialize(apiKey);
      }
      updateSettings({ apiKey });
      setIsDialogOpen(false);
      toast({
        title: '設定を保存しました',
        description: 'AIの設定が正常に更新されました。',
      });
    } catch (error) {
      toast({
        title: 'エラーが発生しました',
        description:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (): void => {
    updateSettings({ apiKey: undefined });
    setApiKey('');
    toast({
      title: 'APIキーを削除しました',
      description: 'AIの設定が正常に更新されました。',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI設定</CardTitle>
        <CardDescription>
          タスク管理をサポートするAI機能の設定を行います。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Gemini APIキー</Label>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                type="password"
                value={settings.apiKey ? '********' : '未設定'}
                disabled
              />
            </div>
            <EditButton onClick={() => setIsDialogOpen(true)} />
            {settings.apiKey && <DeleteButton onClick={handleDelete} />}
          </div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini APIキーの設定</DialogTitle>
            <DialogDescription>
              Google AI StudioからGemini APIキーを取得して設定してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">APIキー</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaS..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
