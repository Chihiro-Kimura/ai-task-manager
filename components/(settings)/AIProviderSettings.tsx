'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AIProviderManager } from '@/lib/ai/provider-manager';
import { useAIProviderStore } from '@/store/ai-provider-store';

const formSchema = z.object({
  provider: z.enum(['openai', 'gemini'] as const),
  apiKey: z.string().min(1, 'APIキーを入力してください'),
});

type FormValues = z.infer<typeof formSchema>;

export function AIProviderSettings(): ReactElement {
  const { provider, apiKey, setProvider, setApiKey, setInitialized } = useAIProviderStore();
  const { toast } = useToast();
  const providerManager = AIProviderManager.getInstance();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider,
      apiKey: apiKey || '',
    },
  });

  // 初期化時にストアの値を使ってプロバイダーを設定
  useEffect(() => {
    if (apiKey) {
      try {
        providerManager.initializeProvider(provider, apiKey);
        providerManager.setActiveProvider(provider);
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize provider:', error);
        setInitialized(false);
      }
    }
  }, [provider, apiKey, setInitialized]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    try {
      providerManager.initializeProvider(values.provider, values.apiKey);
      providerManager.setActiveProvider(values.provider);
      setProvider(values.provider);
      setApiKey(values.apiKey);
      setInitialized(true);

      toast({
        title: '設定を保存しました',
        description: 'AIプロバイダーの設定を更新しました',
      });
    } catch (error) {
      setInitialized(false);
      toast({
        title: 'エラーが発生しました',
        description: error instanceof Error ? error.message : '設定の保存に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI設定</CardTitle>
        <CardDescription>
          AIプロバイダーとAPIキーを設定します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AIプロバイダー</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {providerManager.getProviderInfo(field.value)?.name}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="openai">
                        {providerManager.getProviderInfo('openai')?.name}
                      </SelectItem>
                      <SelectItem value="gemini">
                        {providerManager.getProviderInfo('gemini')?.name}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {providerManager.getProviderInfo(field.value)?.description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>APIキー</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={`${form.watch('provider') === 'openai' ? 'OpenAI' : 'Gemini'} APIキーを入力`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch('provider') === 'openai'
                      ? 'OpenAIのAPIキーを入力してください'
                      : 'Google Cloud PlatformのAPIキーを入力してください'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? '保存中...' : '保存'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 