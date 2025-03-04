'use client';

import { Plus, Sparkles, X } from 'lucide-react';
import { type ReactElement } from 'react';
import { useState } from 'react';

import TagSelect from '@/components/(common)/forms/TagSelect';
import DueDatePicker from '@/components/(tasks)/filters/DueDatePicker';
import PrioritySelect from '@/components/(tasks)/filters/PrioritySelect';
import { AICategory } from '@/components/(tasks)/item/features/ai/AICategory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { TaskInput } from '@/lib/ai/types';
import { useAIStore } from '@/store/aiStore';
import { Priority, Tag } from '@/types/common';

interface AddTaskFormProps {
  onSubmit: (task: TaskInput & {
    status: string;
    task_order: number;
    category?: string;
    due_date: string | null;
  }) => void;
  onCancel: () => void;
  category?: string;
}

export default function AddTaskForm({
  onSubmit,
  onCancel,
  category,
}: AddTaskFormProps): ReactElement {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classifyResult, setClassifyResult] = useState<{
    category: 'box' | 'now' | 'next';
    confidence: number;
    reason: string;
  } | null>(null);

  const { settings } = useAIStore();
  const isAIEnabled = settings.isEnabled;
  
  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setPriority(null);
    setDueDate(undefined);
    setSelectedTags([]);
    setClassifyResult(null);
  };

  const handleSubmit = (): void => {
    if (!title) return;

    onSubmit({
      title,
      description,
      priority,
      tags: selectedTags,
      status: 'todo',
      task_order: 0,
      category,
      due_date: dueDate?.toISOString() || null,
    });
    resetForm();
  };

  const handleCancel = (): void => {
    resetForm();
    onCancel();
  };

  const handleInputFocus = (): void => {
    // フォーカス時の処理（必要に応じて実装）
  };

  const handleAIAnalyze = async (): Promise<void> => {
    if (!title || !description) {
      toast({
        title: 'エラー',
        description: 'タイトルと説明を入力してください',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: description,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '分類に失敗しました');
      }

      setClassifyResult(data);
    } catch (error) {
      toast({
        title: 'AIによる分析に失敗しました',
        description: error instanceof Error ? error.message : 'AI機能が正しく設定されているか確認してください',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectCategory = (): void => {
    if (classifyResult) {
      onSubmit({
        title,
        description,
        priority,
        tags: selectedTags,
        status: 'todo',
        task_order: 0,
        category: classifyResult.category,
        due_date: dueDate?.toISOString() || null,
      });
      resetForm();
    }
  };

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
          onFocus={handleInputFocus}
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
            onTagsChange={setSelectedTags}
            variant="icon"
            className="flex-none"
          />
          {isAIEnabled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAIAnalyze}
              disabled={isAnalyzing}
              className="flex-none ml-auto"
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
            </Button>
          )}
        </div>
        {classifyResult && (
          <AICategory
            task={{
              id: '',
              title,
              description,
              priority: null,
              status: 'todo',
              task_order: 0,
              category: '',
              due_date: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              userId: '',
              tags: [],
            }}
            category={{
              category: classifyResult.category,
              confidence: classifyResult.confidence,
            }}
            onMutate={async () => handleSelectCategory()}
          />
        )}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="mr-2 h-4 w-4" />
            追加
          </Button>
        </div>
      </div>
    </div>
  );
}
