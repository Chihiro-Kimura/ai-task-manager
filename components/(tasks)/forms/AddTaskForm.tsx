'use client';

import { Plus, X } from 'lucide-react';
import { type ReactElement, useCallback, useEffect, useState } from 'react';

import TagSelect from '@/components/(common)/forms/tag-select';
import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import { PrioritySelect } from '@/components/(tasks)/filters/PrioritySelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTagManagement } from '@/hooks/use-tag-management';
import { useToast } from '@/hooks/use-toast';
import { Priority, Tag } from '@/types/common';
import { CreateTaskData } from '@/types/task';

interface AddTaskFormProps {
  onSubmit: (task: CreateTaskData) => void;
  onCancel: () => void;
  category: string;
}

export default function AddTaskForm({
  onSubmit,
  onCancel,
  category,
}: AddTaskFormProps): ReactElement {
  console.log('[AddTaskForm] Rendering with category:', category);

  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const {
    tags: availableTags,
    isLoading: isTagsLoading,
    loadTags,
    createNewTag,
    updateTagSelection,
    error: tagError
  } = useTagManagement({
    onTagsChange: setSelectedTags
  });

  // コンポーネントのマウント時の状態をログ
  useEffect(() => {
    console.log('[AddTaskForm] Component mounted:', {
      availableTags,
      isTagsLoading,
      selectedTags
    });
  }, []);

  // 初期ロード時にタグを取得
  useEffect(() => {
    const initializeTags = async () => {
      console.log('[AddTaskForm] Initializing tags...');
      try {
        const tags = await loadTags();
        console.log('[AddTaskForm] Tags loaded:', tags);
      } catch (error) {
        console.error('[AddTaskForm] Error loading tags:', error);
      }
    };

    void initializeTags();
  }, [loadTags]);

  // タグの状態変更を監視
  useEffect(() => {
    console.log('[AddTaskForm] Tags state changed:', {
      availableTags,
      selectedTags,
      isTagsLoading
    });
  }, [availableTags, selectedTags, isTagsLoading]);

  // タグ関連のエラーを監視
  useEffect(() => {
    if (tagError) {
      console.error('[AddTaskForm] Tag error:', tagError);
      toast({
        title: 'エラー',
        description: tagError.message,
        variant: 'destructive',
      });
    }
  }, [tagError, toast]);
  
  const resetForm = useCallback((): void => {
    console.log('[AddTaskForm] Resetting form');
    setTitle('');
    setDescription('');
    setPriority(null);
    setDueDate(undefined);
    setSelectedTags([]);
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!title) return;

    try {
      console.log('[AddTaskForm] Submitting form:', {
        title,
        description,
        priority,
        tags: selectedTags,
        category,
        dueDate
      });

      await onSubmit({
        title,
        description,
        priority,
        tags: selectedTags,
        status: 'todo',
        task_order: 0,
        category,
        due_date: dueDate,
      });
      resetForm();
    } catch (error) {
      console.error('[AddTaskForm] Submit error:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'タスクの作成に失敗しました',
        variant: 'destructive',
      });
    }
  }, [title, description, priority, selectedTags, category, dueDate, onSubmit, resetForm, toast]);

  const handleCancel = useCallback((): void => {
    console.log('[AddTaskForm] Cancelling form');
    resetForm();
    onCancel();
  }, [resetForm, onCancel]);

  const handleTagsChange = useCallback(async (tags: Tag[]): Promise<void> => {
    console.log('[AddTaskForm] handleTagsChange called with:', tags);
    try {
      // 新しいタグの作成が必要な場合
      const processedTags = await Promise.all(
        tags.map(async (tag) => {
          if (tag.id.startsWith('new-')) {
            console.log('[AddTaskForm] Creating new tag:', tag.name);
            const newTag = await createNewTag(tag.name);
            console.log('[AddTaskForm] Created new tag:', newTag);
            return newTag || tag;
          }
          return tag;
        })
      );

      console.log('[AddTaskForm] Processed tags:', processedTags);

      // タグの選択状態を更新
      await updateTagSelection(processedTags);
      
      // ローカルの状態を更新
      const normalizedTags = processedTags.map(tag => ({
        ...tag,
        createdAt: tag.createdAt instanceof Date ? tag.createdAt : new Date(tag.createdAt)
      }));
      console.log('[AddTaskForm] Setting normalized tags:', normalizedTags);
      setSelectedTags(normalizedTags);
    } catch (error) {
      console.error('[AddTaskForm] Error handling tags:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'タグの更新に失敗しました',
        variant: 'destructive',
      });
    }
  }, [createNewTag, updateTagSelection, toast]);

  console.log('[AddTaskForm] Rendering with:', {
    availableTags,
    selectedTags,
    isTagsLoading
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">新規タスク</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="text-zinc-400 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <Input
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="説明"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex items-center gap-2">
          <PrioritySelect
            value={priority}
            onValueChange={setPriority}
            className="flex-none"
          />
          <DueDatePicker
            dueDate={dueDate}
            setDueDate={setDueDate}
            variant="icon"
            className="flex-none"
          />
          <TagSelect
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            variant="icon"
            className="flex-none"
            initialTags={availableTags}
            isLoading={isTagsLoading}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button onClick={() => void handleSubmit()}>
            <Plus className="mr-2 h-4 w-4" />
            追加
          </Button>
        </div>
      </div>
    </div>
  );
}
