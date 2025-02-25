'use client';

import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { format, isBefore, isToday, isAfter, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Pencil, Trash2, Flag, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';

import EditTaskForm from '@/components/(tasks)/forms/EditTaskForm';
import { EditButton, DeleteButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAISettings } from '@/hooks/use-ai-settings';
import { useToast } from '@/hooks/use-toast';
import { Priority } from '@/lib/ai/types';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

interface TaskItemProps {
  task: TaskWithExtras;
  onMutate: () => Promise<void>;
}

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Icons;
}

const Icons = {
  fileText: Pencil,
  tag: Flag,
  alertCircle: ExclamationTriangleIcon,
  folder: Trash2,
  lightbulb: Sparkles,
} as const;

const AI_FEATURES: AIFeature[] = [
  {
    id: 'summary',
    title: 'タスクの要約生成',
    description:
      'タスクの内容から重要なポイントを抽出し、簡潔な要約を生成します',
    icon: 'fileText',
  },
  {
    id: 'tags',
    title: 'タグの提案',
    description: 'タスクの内容から関連するタグを自動で提案します',
    icon: 'tag',
  },
  {
    id: 'priority',
    title: '優先度の分析',
    description: 'タスクの緊急度と重要度を分析し、優先度を提案します',
    icon: 'alertCircle',
  },
  {
    id: 'classify',
    title: 'タスクの分類',
    description: 'タスクを「今すぐ」「次に」「いつか」のカテゴリに分類します',
    icon: 'folder',
  },
  {
    id: 'suggest',
    title: '次のタスクの提案',
    description: '現在のタスク一覧から、次に取り組むべきタスクを提案します',
    icon: 'lightbulb',
  },
];

export default function TaskItem({
  task,
  onMutate,
}: TaskItemProps): ReactElement {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { setIsEditModalOpen } = useTaskStore();
  const { settings, updateSettings } = useAISettings();
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null
  );
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [summary, setSummary] = useState<{
    summary: string;
    keywords: string[];
  }>();
  const [suggestedTags, setSuggestedTags] = useState<string[]>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [analyzedPriority, setAnalyzedPriority] = useState<Priority>();

  const handleToggleStatus = async (): Promise<void> => {
    const newStatus = task.status === '完了' ? '未完了' : '完了';
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await onMutate();
        toast({
          title: 'ステータス更新',
          description: `タスクを${newStatus}に変更しました`,
          icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
        });
      } else {
        throw new Error('ステータスの更新に失敗しました');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      });

      if (!response.ok) {
        throw new Error('タスクの削除に失敗しました');
      }

      await onMutate(); // タスク一覧を更新
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: 'エラー',
        description: 'タスクの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (): void => {
    setIsEditing(true);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = (): void => {
    setIsEditing(false);
    setIsEditModalOpen(false);
  };

  const handleFeatureSelect = async (featureId: string): Promise<void> => {
    setSelectedFeatureId(featureId);
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch(`/api/ai/${featureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey && { 'x-api-key': settings.apiKey }),
        },
        body: JSON.stringify({
          engine: settings.provider,
          title: task.title,
          content: task.description || '',
          ...(featureId === 'tags' && { existingTags: [] }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'エラーが発生しました');
      }

      const data = await response.json();
      switch (featureId) {
        case 'summary':
          setSummary(data);
          break;
        case 'tags':
          setSuggestedTags(data);
          setSelectedTags(data);
          break;
        case 'priority':
          setAnalyzedPriority(data);
          break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTags = async (): Promise<void> => {
    await handleUpdateTags(selectedTags);
    setSelectedFeatureId(null);
    setIsAIDialogOpen(false);
  };

  const handleApplyPriority = async (): Promise<void> => {
    if (analyzedPriority) {
      await handleUpdatePriority(analyzedPriority);
      setSelectedFeatureId(null);
      setIsAIDialogOpen(false);
    }
  };

  const handleUpdatePriority = async (priority: Priority): Promise<void> => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({ priority }),
      });

      if (res.ok) {
        await onMutate();
        toast({
          title: '優先度更新',
          description: `優先度を${priority}に変更しました`,
          icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
        });
      } else {
        throw new Error('優先度の更新に失敗しました');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  const handleUpdateTags = async (tags: string[]): Promise<void> => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session?.user?.id || '',
        },
        body: JSON.stringify({ tags }),
      });

      if (res.ok) {
        await onMutate();
        toast({
          title: 'タグ更新',
          description: 'タグを更新しました',
          icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
        });
      } else {
        throw new Error('タグの更新に失敗しました');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '不明なエラー';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />,
      });
    }
  };

  const getDueDateColor = (dueDate: Date | null): string => {
    if (!dueDate) return 'text-zinc-400';

    const today = startOfDay(new Date());

    if (isBefore(dueDate, today)) return 'text-rose-400';
    if (isToday(dueDate)) return 'text-amber-400';
    if (isAfter(dueDate, today)) return 'text-blue-400';

    return 'text-zinc-400';
  };

  const handleProviderChange = (value: string): void => {
    if (value === 'gemini' && !settings.apiKey) {
      setShowApiKeyDialog(true);
      return;
    }
    updateSettings({ provider: value as 'gemini' | 'transformers' });
  };

  const handleNavigateToSettings = (): void => {
    setIsAIDialogOpen(false);
    setShowApiKeyDialog(false);
    router.push('/settings');
  };

  return (
    <>
      {isEditing ? (
        <EditTaskForm
          taskId={task.id}
          currentTitle={task.title}
          currentDescription={task.description}
          currentPriority={task.priority}
          currentDueDate={task.due_date}
          onClose={handleCloseEdit}
        />
      ) : (
        <div className="group relative">
          <div className="p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.status === '完了'}
                onCheckedChange={handleToggleStatus}
                className={cn(
                  'h-4 w-4 border transition-colors',
                  task.status === '完了'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:border-blue-400'
                    : 'border-zinc-600 bg-zinc-900/50 hover:border-zinc-500'
                )}
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'text-sm font-medium',
                    task.status === '完了'
                      ? 'text-zinc-400 line-through'
                      : 'text-zinc-100'
                  )}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={cn(
                      'mt-1 text-xs',
                      task.status === '完了'
                        ? 'text-zinc-500 line-through'
                        : 'text-zinc-400'
                    )}
                  >
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {task.priority && (
                  <Flag
                    className={cn(
                      'h-4 w-4',
                      task.priority === '高' && 'text-rose-500',
                      task.priority === '中' && 'text-amber-500',
                      task.priority === '低' && 'text-emerald-500'
                    )}
                  />
                )}
                {task.due_date && (
                  <span
                    className={cn(
                      'text-xs',
                      task.status === '完了'
                        ? 'text-zinc-500'
                        : getDueDateColor(new Date(task.due_date))
                    )}
                  >
                    {format(new Date(task.due_date), 'MM/dd', { locale: ja })}
                  </span>
                )}
                <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">
                        AIアシスタント
                      </DialogTitle>
                      <DialogDescription>
                        AIを使用してタスクの分析と提案を行います
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs
                      value={settings.provider}
                      onValueChange={handleProviderChange}
                      className="w-full"
                    >
                      <TabsList className="w-full grid grid-cols-2 bg-zinc-900 border border-zinc-800">
                        <TabsTrigger
                          value="transformers"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Transformers
                        </TabsTrigger>
                        <TabsTrigger
                          value="gemini"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Gemini AI
                        </TabsTrigger>
                      </TabsList>
                      <div className="mt-4 space-y-4">
                        {settings.provider === 'transformers' && (
                          <div className="grid gap-4 md:grid-cols-2">
                            {AI_FEATURES.map((feature) => {
                              const Icon = Icons[feature.icon];
                              return (
                                <div
                                  key={feature.id}
                                  className="rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                                  onClick={() =>
                                    handleFeatureSelect(feature.id)
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <h4 className="text-sm font-medium text-zinc-100">
                                      {feature.title}
                                    </h4>
                                  </div>
                                  <p className="mt-1 text-sm text-zinc-400">
                                    {feature.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {settings.provider === 'gemini' && (
                          <>
                            {!settings.apiKey ? (
                              <div className="rounded-lg border border-zinc-800 p-4">
                                <h4 className="text-sm font-medium text-zinc-100">
                                  APIキーが必要です
                                </h4>
                                <p className="mt-1 text-sm text-zinc-400">
                                  Gemini
                                  AIを使用するには、設定画面でAPIキーを設定してください
                                </p>
                                <Button
                                  className="mt-4 w-full"
                                  onClick={handleNavigateToSettings}
                                >
                                  設定ページへ移動
                                </Button>
                              </div>
                            ) : (
                              <div className="grid gap-4 md:grid-cols-2">
                                {AI_FEATURES.map((feature) => {
                                  const Icon = Icons[feature.icon];
                                  return (
                                    <div
                                      key={feature.id}
                                      className="rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900/50 cursor-pointer transition-colors"
                                      onClick={() =>
                                        handleFeatureSelect(feature.id)
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <h4 className="text-sm font-medium text-zinc-100">
                                          {feature.title}
                                        </h4>
                                      </div>
                                      <p className="mt-1 text-sm text-zinc-400">
                                        {feature.description}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <EditButton onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </EditButton>
            <DeleteButton onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </DeleteButton>
          </div>
        </div>
      )}

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>APIキーが必要です</DialogTitle>
            <DialogDescription>
              Gemini
              AIを使用するには、APIキーの設定が必要です。設定ページでAPIキーを設定しますか？
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowApiKeyDialog(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleNavigateToSettings}>設定ページへ移動</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
