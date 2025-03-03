'use client';

import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { format, isAfter, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Flag, MoreVertical, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type ReactElement, useState } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import EditTaskForm from '@/components/(tasks)/forms/EditTaskForm';
import AITaskAnalysis from '@/components/(tasks)/item/AITaskAnalysis';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAISettings } from '@/hooks/use-ai-settings';
import { useToast } from '@/hooks/use-toast';
import { summaryCache } from '@/lib/ai/cache';
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
  icon: keyof typeof iconMap;
}

const iconMap = {
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
  task: initialTask,
  onMutate,
}: TaskItemProps): ReactElement {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { setIsEditModalOpen } = useTaskStore();
  const { tasks, setTasks } = useTaskStore();
  const { settings } = useAISettings();
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const [aiResults, setAIResults] = useState<{
    summary?: { summary: string };
    tags?: string[];
    priority?: '高' | '中' | '低';
    category?: { category: string; confidence: number };
    nextTask?: {
      title: string;
      description: string;
      priority: '高' | '中' | '低';
    };
  }>({});

  // グローバルストアから現在のタスクを取得
  const task = tasks.find(t => t.id === initialTask.id) || initialTask;

  // タスクの状態を更新する関数
  const handleMutation = async (): Promise<void> => {
    try {
      // サーバーから最新のタスク情報を取得（タグ情報も含める）
      const response = await fetch(`/api/tasks/${task.id}?include=tags`, {
        headers: {
          'X-User-Id': session?.user?.id || '',
        },
      });

      if (!response.ok) {
        throw new Error('タスク情報の取得に失敗しました');
      }

      const updatedTask = await response.json();
      
      // グローバルストアを更新
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      
      // 親コンポーネントの更新処理を実行
      await onMutate();
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    }
  };

  const handleFeatureSelect = async (featureId: string): Promise<void> => {
    setSelectedFeatureId(featureId);
    setError(undefined);
    setIsLoading(true);

    try {
      let requestBody;

      switch (featureId) {
        case 'summary': {
          // キャッシュをチェック
          const cachedSummary = summaryCache.get(
            task.title,
            task.description || ''
          );
          if (cachedSummary) {
            setAIResults((prev) => ({ ...prev, summary: cachedSummary }));
            setIsLoading(false);
            return;
          }

          requestBody = {
            title: task.title,
            content: task.description || '',
          };
          break;
        }
        case 'classify':
        case 'priority':
          requestBody = {
            title: task.title,
            content: task.description || '',
          };
          break;
        case 'tags':
          requestBody = {
            title: task.title,
            content: task.description || '',
            existingTags: task.tags || [],
          };
          break;
        case 'suggest':
          requestBody = {
            tasks: [
              {
                title: task.title,
                description: task.description || '',
                priority: task.priority as Priority,
                status: task.status,
              },
            ],
          };
          break;
        default:
          throw new Error('不明な機能が指定されました');
      }

      const response = await fetch(`/api/ai/${featureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey && { 'x-api-key': settings.apiKey }),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'AIの処理中にエラーが発生しました');
      }

      const result = await response.json();
      setIsLoading(false);

      switch (featureId) {
        case 'summary':
          summaryCache.set(task.title, task.description || '', result);
          setAIResults((prev) => ({ ...prev, summary: result }));
          break;
        case 'tags':
          setAIResults((prev) => ({ ...prev, tags: result }));
          break;
        case 'priority':
          setAIResults((prev) => ({ ...prev, priority: result }));
          break;
        case 'classify':
          setAIResults((prev) => ({ ...prev, category: result }));
          break;
        case 'suggest':
          setAIResults((prev) => ({ ...prev, nextTask: result }));
          break;
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'AIの処理中にエラーが発生しました'
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="group relative flex items-start gap-1 rounded-lg border border-zinc-800 bg-gradient-to-b from-slate-900 to-slate-900/80 px-1 py-2.5 md:min-h-[8.5rem] lg:min-h-[9rem] hover:from-slate-900/90 hover:to-slate-900/70 transition-colors w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 h-full">
            <Checkbox
              checked={task.status === '完了'}
              onCheckedChange={async () => {
                try {
                  const res = await fetch(`/api/tasks/${task.id}/status`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-User-Id': session?.user?.id || '',
                    },
                    body: JSON.stringify({
                      status: task.status === '完了' ? '未完了' : '完了',
                    }),
                  });

                  if (res.ok) {
                    await handleMutation();
                    toast({
                      title: 'ステータス更新',
                      description: 'タスクのステータスを更新しました',
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
                    icon: (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
                    ),
                  });
                }
              }}
              className="h-3.5 w-3.5 mt-0.5"
            />
            <div className="flex-1 min-w-0 flex flex-col h-full">
              <div className="flex items-center gap-3">
                {isTitleTruncated ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          ref={(el) => {
                            if (el) {
                              const isTruncated = el.scrollWidth > el.offsetWidth;
                              setIsTitleTruncated(isTruncated);
                            }
                          }}
                          className={cn(
                            'flex-1 font-medium truncate tracking-tight min-w-0 text-sm',
                            task.status === '完了' && 'line-through text-zinc-500'
                          )}
                        >
                          {task.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={16}
                        className="z-[60] translate-y-1"
                      >
                        <p className="max-w-xs break-words">{task.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span
                    ref={(el) => {
                      if (el) {
                        const isTruncated = el.scrollWidth > el.offsetWidth;
                        setIsTitleTruncated(isTruncated);
                      }
                    }}
                    className={cn(
                      'flex-1 font-medium truncate tracking-tight min-w-0 text-sm',
                      task.status === '完了' && 'line-through text-zinc-500'
                    )}
                  >
                    {task.title}
                  </span>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  {task.priority && (
                    <Flag
                      className={cn(
                        'h-4 w-4',
                        task.priority === '高' && 'text-rose-400',
                        task.priority === '中' && 'text-amber-400',
                        task.priority === '低' && 'text-emerald-400'
                      )}
                    />
                  )}
                  {task.due_date && (
                    <time
                      dateTime={typeof task.due_date === 'string' 
                        ? task.due_date 
                        : task.due_date.toISOString()
                      }
                      className={cn(
                        'text-sm whitespace-nowrap font-medium transition-colors',
                        isAfter(new Date(task.due_date), new Date())
                          ? 'text-zinc-500'
                          : 'text-rose-400'
                      )}
                    >
                      {isToday(new Date(task.due_date))
                        ? '今日まで'
                        : format(new Date(task.due_date), 'M月d日(E)', {
                            locale: ja,
                          })}
                    </time>
                  )}
                </div>
              </div>
              {task.description && (
                isDescriptionTruncated ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p
                          ref={(el) => {
                            if (el) {
                              const isTruncated = el.scrollHeight > el.clientHeight;
                              setIsDescriptionTruncated(isTruncated);
                            }
                          }}
                          className={cn(
                            'text-xs text-zinc-400 line-clamp-2 md:line-clamp-3 mt-1 flex-1 break-words min-h-[2.5em] md:min-h-[3.75em] pb-0.5',
                            task.status === '完了' && 'line-through'
                          )}
                        >
                          {task.description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={16}
                        className="z-[60] -translate-y-6"
                      >
                        <p className="max-w-xs break-words whitespace-pre-wrap">{task.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <p
                    ref={(el) => {
                      if (el) {
                        const isTruncated = el.scrollHeight > el.clientHeight;
                        setIsDescriptionTruncated(isTruncated);
                      }
                    }}
                    className={cn(
                      'text-xs text-zinc-400 line-clamp-2 md:line-clamp-3 mt-1 flex-1 break-words min-h-[2.5em] md:min-h-[3.75em] pb-0.5',
                      task.status === '完了' && 'line-through'
                    )}
                  >
                    {task.description}
                  </p>
                )
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="mt-auto pt-1 flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <ColoredTag key={tag.id} tag={tag} className="text-xs" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 sm:relative sm:right-0 sm:top-0 sm:translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-zinc-800/50"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-zinc-950 border-zinc-800"
            >
              <DropdownMenuItem
                className="flex items-center gap-2 text-zinc-300 focus:text-zinc-100 cursor-pointer"
                onClick={() => {
                  setIsAIDialogOpen(true);
                  setSelectedFeatureId(null);
                }}
              >
                <Sparkles className="h-4 w-4" />
                <span>AIアシスタント</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-zinc-300 focus:text-zinc-100 cursor-pointer"
                onClick={() => {
                  setIsEditing(true);
                  setIsEditModalOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
                <span>編集</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/tasks/${task.id}`, {
                      method: 'DELETE',
                      headers: {
                        'X-User-Id': session?.user?.id || '',
                      },
                    });

                    if (res.ok) {
                      // 削除成功時はグローバルストアから削除
                      setTasks(tasks.filter((t) => t.id !== task.id));
                      await onMutate();
                      toast({
                        title: 'タスク削除',
                        description: 'タスクを削除しました',
                        icon: <CheckIcon className="h-4 w-4 text-zinc-100" />,
                      });
                    } else {
                      throw new Error('タスクの削除に失敗しました');
                    }
                  } catch (error: unknown) {
                    const errorMessage =
                      error instanceof Error ? error.message : '不明なエラー';
                    toast({
                      title: 'エラー',
                      description: errorMessage,
                      variant: 'destructive',
                      icon: (
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
                      ),
                    });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span>削除</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">AIアシスタント</DialogTitle>
            <DialogDescription>
              AIを使用してタスクの分析と提案を行います
            </DialogDescription>
          </DialogHeader>
          {!settings.apiKey ? (
            <div className="rounded-lg bg-yellow-500/10 p-4 text-sm text-yellow-500">
              <p>
                Gemini APIキーが設定されていません。
                設定画面からAPIキーを設定してください。
              </p>
            </div>
          ) : selectedFeatureId ? (
            <AITaskAnalysis
              selectedFeatureId={selectedFeatureId}
              isLoading={isLoading}
              error={error}
              summary={aiResults.summary}
              tags={aiResults.tags}
              priority={aiResults.priority}
              category={aiResults.category}
              nextTask={aiResults.nextTask}
              task={task}
              onMutate={handleMutation}
              setSelectedFeatureId={setSelectedFeatureId}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {AI_FEATURES.map((feature) => {
                const Icon = iconMap[feature.icon];
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureSelect(feature.id)}
                    className="flex flex-col gap-2 rounded-lg border border-zinc-800 p-4 text-left hover:bg-zinc-900"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-zinc-400" />
                      <span className="font-medium text-zinc-100">{feature.title}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isEditing && (
        <EditTaskForm
          task={task}
          onSuccess={async () => {
            setIsEditing(false);
            setIsEditModalOpen(false);
            await handleMutation();
          }}
          onCancel={() => {
            setIsEditing(false);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </>
  );
}
