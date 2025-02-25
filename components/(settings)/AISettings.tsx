import { Button } from '@/components/ui/button';
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

export function AISettings() {
  const { settings, updateSettings } = useAIStore();
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const { toast } = useToast();

  const handleProviderChange = (value: string) => {
    updateSettings({ provider: value as 'gemini' | 'transformers' });
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'APIキーを入力してください',
        variant: 'destructive',
      });
      return;
    }

    updateSettings({ apiKey: apiKey.trim() });
    toast({
      title: 'APIキーを保存しました',
      description: 'Gemini AIが使用可能になりました',
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
              <SelectValue />
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
        </div>

        {settings.provider === 'gemini' && (
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-zinc-100">
              Gemini API Key
            </Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-zinc-900 border-zinc-800"
                placeholder="sk-..."
              />
              <Button
                onClick={handleSaveApiKey}
                variant="outline"
                className="border-zinc-800 hover:bg-emerald-900/20 hover:text-emerald-400"
              >
                保存
              </Button>
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
