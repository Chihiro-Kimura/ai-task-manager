'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, type ReactElement, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import TagSelect from '@/components/(common)/forms/tag-select';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Textarea } from '@/components/ui/textarea';
import { useTagManagement } from '@/hooks/use-tag-management';
import { analyzeNoteContent } from '@/lib/ai/analyzers/note-analyzer';
import { useAIStore } from '@/store/aiStore';
import { Priority, Tag } from '@/types/common';
import { CreateNoteData, Note, NoteWithTags } from '@/types/note';

const formSchema = z.object({
  title: z.string().min(1, '必須項目です'),
  content: z.string().min(1, '必須項目です'),
  priority: z.enum(['高', '中', '低']).optional(),
  tags: z.array(z.string()),
  category: z.enum(['general', 'diary', 'idea', 'reference', 'task_note']).default('general'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddNoteFormProps {
  note?: NoteWithTags;
  onSuccess?: () => Promise<void>;
}

export function AddNoteForm({ note, onSuccess }: AddNoteFormProps): ReactElement {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { getActiveProvider } = useAIStore();
  const { data: session, status } = useSession();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
      priority: note?.priority ?? undefined,
      tags: note?.tags.map((tag) => tag.id) ?? [],
      category: note?.type ?? 'general',
    },
  });

  const {
    tags: availableTags,
    isLoading: isTagsLoading,
    loadTags,
    createNewTag,
    updateTagSelection,
    error: tagError
  } = useTagManagement({
    id: note?.id,
    type: 'note',
    initialTags: note?.tags ?? [],
  });

  useEffect(() => {
    console.log('[AddNoteForm] Loading tags...');
    void loadTags();
  }, [loadTags]);

  useEffect(() => {
    console.log('[AddNoteForm] Session status:', status);
    console.log('[AddNoteForm] Session data:', session);
  }, [session, status]);

  const { watch } = form;
  const title = watch('title');
  const content = watch('content');

  const handleAnalyze = async () => {
    if (!title || !content) {
      toast.error('タイトルと内容を入力してください');
      return;
    }

    try {
      setIsAnalyzing(true);
      const provider = getActiveProvider();
      if (!provider.isEnabled) {
        toast.error('AI機能が無効です');
        return;
      }

      const analysis = await analyzeNoteContent(title, content, provider);

      // 分析結果を反映
      form.setValue('priority', analysis.priority);
      form.setValue('category', analysis.category);

      // タグの提案
      if (analysis.suggestedTags.length > 0) {
        toast.success(
          <div className="space-y-2">
            <p>以下のタグを提案します：</p>
            <div className="flex flex-wrap gap-1">
              {analysis.suggestedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-zinc-800 px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      }

      // 関連タスクの提案
      if (analysis.relatedTasks.length > 0) {
        toast.info(
          <div className="space-y-2">
            <p>以下のタスクを提案します：</p>
            <ul className="list-disc pl-4 text-sm">
              {analysis.relatedTasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </div>
        );
      }
    } catch (error) {
      console.error('Failed to analyze note:', error);
      toast.error('メモの分析に失敗しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTagsChange = useCallback(async (tags: Tag[]): Promise<void> => {
    console.log('[AddNoteForm] handleTagsChange called with:', tags);
    try {
      // 新しいタグの作成が必要な場合
      const processedTags = await Promise.all(
        tags.map(async (tag) => {
          if (tag.id.startsWith('new-')) {
            console.log('[AddNoteForm] Creating new tag:', tag.name);
            const newTag = await createNewTag(tag.name);
            console.log('[AddNoteForm] Created new tag:', newTag);
            return newTag || tag;
          }
          return tag;
        })
      );

      console.log('[AddNoteForm] Processed tags:', processedTags);

      // タグの選択状態を更新
      await updateTagSelection(processedTags);
      
      // ローカルの状態を更新
      const normalizedTags = processedTags.map(tag => ({
        ...tag,
        createdAt: tag.createdAt instanceof Date ? tag.createdAt : new Date(tag.createdAt)
      }));
      console.log('[AddNoteForm] Setting normalized tags:', normalizedTags);
      setSelectedTags(normalizedTags);
    } catch (error) {
      console.error('[AddNoteForm] Error handling tags:', error);
      toast({
        title: 'エラー',
        description: 'タグの処理に失敗しました',
        variant: 'destructive',
      });
    }
  }, [createNewTag, updateTagSelection, toast]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    try {
      const noteData: CreateNoteData = {
        title: values.title,
        content: values.content,
        priority: values.priority,
        tags: selectedTags.map(tag => tag.id),
        type: values.category,
      };

      if (note?.id) {
        console.log('[AddNoteForm] Updating note:', note.id, noteData);
        const response = await fetch(`/api/notes/${note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'メモの更新に失敗しました');
        }

        toast.success('メモを更新しました');
      } else {
        console.log('[AddNoteForm] Creating new note:', noteData);
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'メモの作成に失敗しました');
        }

        toast.success('メモを作成しました');
        form.reset();
        setSelectedTags([]);
      }

      await onSuccess?.();
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error(
        error instanceof Error ? error.message : 'メモの保存に失敗しました'
      );
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
                <Input placeholder="タイトルを入力..." {...field} />
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
                <Textarea
                  placeholder="メモの内容を入力..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カテゴリ</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">一般</SelectItem>
                    <SelectItem value="diary">日記</SelectItem>
                    <SelectItem value="idea">アイデア</SelectItem>
                    <SelectItem value="reference">参考資料</SelectItem>
                    <SelectItem value="task_note">タスクメモ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>優先度</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="優先度を選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>タグ</span>
                {availableTags.length === 0 && !isTagsLoading && (
                  <span className="text-xs text-muted-foreground">
                    「＋」ボタンをクリックして新しいタグを作成できます
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <TagSelect
                  type="note"
                  selectedTags={selectedTags}
                  onTagsChange={handleTagsChange}
                  initialTags={availableTags}
                  isLoading={isTagsLoading}
                  placeholder="タグを作成または選択..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !title || !content}
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            AI分析
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || isAnalyzing}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {note ? '更新' : '作成'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
