'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';
import { AIProviderManager } from '@/lib/ai/provider-manager';

const formSchema = z.object({
  provider: z.enum(['gemini'] as const),
  apiKey: z.string().min(1, 'APIキーは必須です'),
});

type FormData = z.infer<typeof formSchema>;

export function AIProviderSettings(): JSX.Element {
  const providerManager = AIProviderManager.getInstance();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: 'gemini',
      apiKey: '',
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      providerManager.initializeProvider(data.provider, data.apiKey);
      toast({
        title: 'APIキーを設定しました',
        description: 'AIプロバイダーの設定が完了しました。',
      });
    } catch {
      toast({
        title: 'エラー',
        description: 'APIキーの設定に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AIプロバイダー</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="AIプロバイダーを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="gemini">
                    {providerManager.getProviderInfo('gemini')?.name}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                使用するAIプロバイダーを選択してください
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
                  placeholder="Gemini APIキーを入力"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Gemini APIキーを入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">保存</Button>
      </form>
    </Form>
  );
} 