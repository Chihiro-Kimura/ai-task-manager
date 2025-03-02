'use client';

import { Tag } from '@prisma/client';
import { Loader2, Plus, Search, Tag as TagIcon } from 'lucide-react';
import { type ReactElement, useEffect, useState, useMemo } from 'react';

import { ColoredTag } from '@/components/(common)/ColoredTag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TAG_MESSAGES } from '@/lib/constants/messages';
import { cn } from '@/lib/utils';
import { createTag, fetchTags, updateTags } from '@/lib/utils/tag';

interface TagSelectProps {
  id?: string;
  type?: 'task' | 'note';
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  suggestedTags?: string[];
  className?: string;
  variant?: 'default' | 'icon';
}

export default function TagSelect({
  id,
  type = 'task',
  selectedTags,
  onTagsChange,
  suggestedTags = [],
  className,
  variant = 'default',
}: TagSelectProps): ReactElement {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  const currentSelectedTags = selectedTags ?? [];

  const loadTags = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await fetchTags();
      setTags(data);
    } catch {
      toast({
        title: 'エラー',
        description: TAG_MESSAGES.FETCH_ERROR,
        variant: 'destructive',
      });
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTags = async (newTags: Tag[]): Promise<void> => {
    try {
      if (!id) {
        onTagsChange(newTags);
        return;
      }

      const updatedTags = await updateTags({
        id,
        type,
        tags: newTags.map((tag) => tag.id),
      });

      onTagsChange(updatedTags);
      void loadTags();
    } catch {
      toast({
        title: 'エラー',
        description: TAG_MESSAGES.UPDATE_ERROR,
        variant: 'destructive',
      });
    }
  };

  const handleCreateTag = async (): Promise<void> => {
    if (!newTagName.trim()) return;

    try {
      setIsCreating(true);
      const newTag = await createTag(newTagName.trim());
      setTags((prev) => [...prev, newTag]);
      setNewTagName('');
      setShowNewTagInput(false);
      // 新規作成したタグを自動選択
      void handleUpdateTags([...currentSelectedTags, newTag]);
      toast({
        title: TAG_MESSAGES.CREATE_SUCCESS,
      });
    } catch {
      toast({
        title: 'エラー',
        description: TAG_MESSAGES.CREATE_ERROR,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    void loadTags();
  }, []);

  const filteredTags = useMemo(() => {
    if (searchQuery) {
      return tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // 検索クエリがない場合は、提案されたタグを優先的に表示
    return [
      ...tags.filter(tag => suggestedTags.includes(tag.name.toLowerCase())),
      ...tags.filter(tag => !suggestedTags.includes(tag.name.toLowerCase()))
    ];
  }, [tags, searchQuery, suggestedTags]);

  const handleSelect = (tagId: string): void => {
    const selectedTag = tags.find((tag) => tag.id === tagId);
    if (!selectedTag) return;

    const isAlreadySelected = currentSelectedTags.some((tag) => tag.id === tagId);
    const newTags = isAlreadySelected
      ? currentSelectedTags.filter((tag) => tag.id !== tagId)
      : [...currentSelectedTags, selectedTag];

    void handleUpdateTags(newTags);
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {variant === 'icon' ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 w-7 p-0 flex items-center justify-center',
                'hover:bg-blue-400/10',
                'data-[state=open]:bg-blue-400/10'
              )}
            >
              <TagIcon
                className={cn(
                  'h-4 w-4',
                  currentSelectedTags.length > 0
                    ? 'text-blue-400/70 hover:text-blue-400'
                    : 'text-zinc-500 hover:text-blue-400'
                )}
              />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start bg-zinc-900/50 border-zinc-800 text-zinc-100"
            >
              {currentSelectedTags.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {currentSelectedTags.map((tag) => (
                    <ColoredTag
                      key={tag.id}
                      tag={tag}
                      className="text-sm"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-zinc-400">タグを選択...</span>
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-3 bg-zinc-900 border-zinc-700">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="タグを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                onClick={() => {
                  setShowNewTagInput(true);
                  setSearchQuery('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showNewTagInput && (
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="新しいタグ名"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void handleCreateTag();
                      } else if (e.key === 'Escape') {
                        setShowNewTagInput(false);
                        setNewTagName('');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    onClick={() => void handleCreateTag()}
                    disabled={isCreating || !newTagName.trim()}
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-zinc-400">
                  Enterで作成、Escでキャンセル
                </p>
              </div>
            )}

            {(searchQuery || showNewTagInput) && <Separator className="bg-zinc-800" />}

            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="p-2 text-sm text-zinc-400">読み込み中...</div>
              ) : filteredTags.length === 0 ? (
                <div className="p-2 text-sm text-zinc-400">
                  タグが見つかりません
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSelect(tag.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-zinc-800",
                        currentSelectedTags.some((selected) => selected.id === tag.id) && "bg-zinc-800",
                        suggestedTags.includes(tag.name.toLowerCase()) && "border border-blue-500/30"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <ColoredTag tag={tag} className="text-sm" />
                        {suggestedTags.includes(tag.name.toLowerCase()) && (
                          <span className="text-xs text-blue-400">推奨</span>
                        )}
                      </span>
                      {currentSelectedTags.some(
                        (selected) => selected.id === tag.id
                      ) && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 