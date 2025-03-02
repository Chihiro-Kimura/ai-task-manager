'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { type ReactElement, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import useSWR from 'swr';
import * as z from 'zod';

import { AddButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getRandomColor } from '@/lib/utils';
import { useAIStore } from '@/store/aiStore';
import { NoteWithTags } from '@/types/note';

const formSchema = z.object({
  title: z.string().min(1, '必須項目です'),
  content: z.string().min(1, '必須項目です'),
  tags: z.array(z.string()),
  priority: z.enum(['高', '中', '低']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddNoteFormProps {
  note?: NoteWithTags;
  onSuccess?: () => void;
}

export function AddNoteForm({
  note,
  onSuccess,
}: AddNoteFormProps): ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [isAnalyzingPriority, setIsAnalyzingPriority] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [pendingTags, setPendingTags] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [localTags, setLocalTags] = useState<{ id: string; name: string }[]>(
    []
  );
  const { getActiveProvider } = useAIStore();

  const { data: tags, mutate: mutateTags } =
    useSWR<{ id: string; name: string }[]>('/api/tags');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      tags: note?.tags?.map((tag) => tag.id) || [],
    },
  });

  const { watch } = form;
  const title = watch('title');
  const content = watch('content');
  const selectedTags = watch('tags');

  useEffect(() => {
    if (tags) {
      setLocalTags(tags);
    }
  }, [tags]);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (title && content) {
        setIsSuggestingTags(true);
        try {
          const provider = getActiveProvider();
          if (!provider.isEnabled) {
            console.warn('AI provider is not enabled');
            return;
          }

          const suggestions = await provider.getTagSuggestions(
            title,
            content,
            localTags
          );
          setSuggestedTags(suggestions);
        } catch (error) {
          console.error('Failed to get tag suggestions:', error);
          toast.error('タグの提案に失敗しました');
        } finally {
          setIsSuggestingTags(false);
        }
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [title, content, localTags, getActiveProvider]);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (title && content) {
        setIsAnalyzingPriority(true);
        try {
          const provider = getActiveProvider();
          if (!provider.isEnabled) {
            console.warn('AI provider is not enabled');
            return;
          }

          const priority = await provider.analyzePriority(title, content);
          form.setValue('priority', priority);
        } catch (error) {
          console.error('Failed to analyze priority:', error);
          toast.error('優先度の分析に失敗しました');
        } finally {
          setIsAnalyzingPriority(false);
        }
      }
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [title, content, getActiveProvider, form]);

  const toggleTag = (tagId: string): void => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    form.setValue('tags', newTags, { shouldDirty: true });
  };

  const createTag = async (name: string): Promise<string | null> => {
    try {
      const randomColor = getRandomColor();
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          color: JSON.stringify(randomColor),
        }),
      });

      if (!response.ok) throw new Error('Failed to create tag');

      const newTag = await response.json();
      setLocalTags((prev) => [...prev, newTag]);
      return newTag.id;
    } catch (error) {
      console.error('Failed to create tag:', error);
      toast.error('タグの作成に失敗しました');
      return null;
    }
  };

  const handleSuggestedTagClick = async (tagName: string): Promise<void> => {
    const existingTag = localTags?.find(
      (t) => t.name.toLowerCase() === tagName.toLowerCase()
    );

    if (existingTag) {
      toggleTag(existingTag.id);
      return;
    }

    if (pendingTags[tagName]) return;

    setPendingTags((prev) => ({ ...prev, [tagName]: true }));
    const newTagId = await createTag(tagName);
    setPendingTags((prev) => ({ ...prev, [tagName]: false }));

    if (newTagId) {
      toggleTag(newTagId);
      // タグリストの更新は非同期で行う
      mutateTags().catch(console.error);
    }
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        note ? `/api/notes/${note.id}` : '/api/notes',
        {
          method: note ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      toast.success(note ? 'メモを更新しました' : 'メモを作成しました');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error(
        note ? 'メモの更新に失敗しました' : 'メモの作成に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>内容</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border border-zinc-800 p-4">
          <div>
            <FormLabel className="text-base">タグ管理</FormLabel>
            <p className="text-sm text-muted-foreground mt-1">
              タグを選択するか、AIが提案したタグを使用できます
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">既存のタグ</p>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded-md bg-zinc-900/50">
                {localTags?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    タグがありません
                  </p>
                ) : (
                  localTags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={
                        selectedTags.includes(tag.id) ? 'default' : 'outline'
                      }
                      className={`cursor-pointer transition-all hover:opacity-80 ${
                        selectedTags.includes(tag.id)
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                      <span className="ml-1 text-xs opacity-70">
                        {selectedTags.includes(tag.id) ? '✓' : '+'}
                      </span>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium">AIによるタグ提案</p>
                {isSuggestingTags && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>提案中...</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded-md bg-zinc-900/50">
                {suggestedTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {title && content
                      ? 'タグを提案できませんでした'
                      : 'タイトルと内容を入力するとタグを提案します'}
                  </p>
                ) : (
                  suggestedTags.map((tagName, index) => {
                    const existingTag = localTags?.find(
                      (t) => t.name.toLowerCase() === tagName.toLowerCase()
                    );
                    const isPending = pendingTags[tagName];
                    const isSelected =
                      existingTag && selectedTags.includes(existingTag.id);

                    return (
                      <Badge
                        key={index}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all hover:opacity-80 ${
                          isPending
                            ? 'opacity-50'
                            : isSelected
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        onClick={() => handleSuggestedTagClick(tagName)}
                      >
                        {isPending ? (
                          <div className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {tagName}
                          </div>
                        ) : (
                          <>
                            {tagName}
                            <span className="ml-1 text-xs opacity-70">
                              {isSelected ? '✓' : '+'}
                            </span>
                          </>
                        )}
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              onClick={() => handleSuggestedTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>優先度</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={field.value === '高' ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      field.value === '高'
                        ? 'bg-rose-500 hover:bg-rose-600'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                    onClick={() => field.onChange('高')}
                  >
                    高
                  </Badge>
                  <Badge
                    variant={field.value === '中' ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      field.value === '中'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                    onClick={() => field.onChange('中')}
                  >
                    中
                  </Badge>
                  <Badge
                    variant={field.value === '低' ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      field.value === '低'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                    onClick={() => field.onChange('低')}
                  >
                    低
                  </Badge>
                  {isAnalyzingPriority && (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AddButton
          type="submit"
          disabled={isLoading || Object.values(pendingTags).some(Boolean)}
          className="flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {note ? 'メモを更新' : 'メモを作成'}
        </AddButton>
      </form>
    </Form>
  );
}
