'use client';

import { Loader2, Plus, Search, Tag as TagIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type ReactElement } from 'react';

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
import { cn } from '@/lib/utils/styles';
import { Tag } from '@/types/common';

interface TagSelectClientProps {
  id?: string;
  type?: 'task' | 'note';
  initialTags: Tag[];
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  variant?: 'default' | 'icon';
  noBorder?: boolean;
  className?: string;
}

export function TagSelectClient({
  id,
  type = 'task',
  initialTags,
  selectedTags,
  onTagsChange,
  variant = 'default',
  noBorder = false,
  className,
}: TagSelectClientProps): ReactElement {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>(initialTags);

  // 初期タグの更新を監視
  useEffect(() => {
    if (initialTags.length > 0) {
      setAvailableTags(prevTags => {
        // 既存のタグと新しいタグをマージ
        const mergedTags = [...prevTags];
        initialTags.forEach(newTag => {
          const existingIndex = mergedTags.findIndex(tag => tag.id === newTag.id);
          if (existingIndex === -1) {
            mergedTags.push(newTag);
          }
        });
        return mergedTags;
      });
    }
  }, [initialTags]);

  // メモ化された検索結果
  const filteredTags = useMemo(() => {
    if (!searchQuery) return availableTags;
    return availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableTags, searchQuery]);

  // 新規タグ作成ハンドラー
  const handleCreateTag = useCallback(async () => {
    if (!newTagName.trim() || isCreating) return;

    try {
      setIsCreating(true);
      
      // 既存のタグをチェック
      const existingTag = availableTags.find(
        tag => tag.name.toLowerCase() === newTagName.toLowerCase()
      );

      if (existingTag) {
        // 既存のタグが選択されていない場合は選択する
        if (!selectedTags.some(tag => tag.id === existingTag.id)) {
          await onTagsChange([...selectedTags, existingTag]);
        }
        setNewTagName('');
        setShowNewTagInput(false);
        return;
      }

      // 新しいタグを作成
      const newTag: Tag = {
        id: `new-${Date.now()}`,
        name: newTagName.trim(),
        color: null,
        userId: '',
        createdAt: new Date(),
      };

      // 選択済みタグに追加
      const updatedTags = [...selectedTags, newTag];
      
      // 利用可能なタグにも追加
      setAvailableTags(prev => [...prev, newTag]);
      
      // 親コンポーネントに通知
      await onTagsChange(updatedTags);
      
      setNewTagName('');
      setShowNewTagInput(false);
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'タグの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  }, [newTagName, isCreating, selectedTags, availableTags, onTagsChange, toast]);

  // タグ選択ハンドラー
  const handleSelect = useCallback(async (tag: Tag) => {
    console.log('[TagSelectClient] Handling tag selection:', tag);
    try {
      const isSelected = selectedTags.some((t) => t.id === tag.id);
      const updatedTags = isSelected
        ? selectedTags.filter((t) => t.id !== tag.id)
        : [...selectedTags, tag];

      console.log('[TagSelectClient] Updated tags after selection:', updatedTags);
      await onTagsChange(updatedTags);
    } catch (error) {
      console.error('[TagSelectClient] Error selecting tag:', error);
      toast({
        title: 'エラー',
        description: 'タグの選択に失敗しました',
        variant: 'destructive',
      });
    }
  }, [selectedTags, onTagsChange, toast]);

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
              role="combobox"
              aria-expanded={isOpen}
              type="button"
            >
              <TagIcon
                className={cn(
                  'h-4 w-4',
                  selectedTags.length > 0
                    ? 'text-blue-400/70 hover:text-blue-400'
                    : 'text-zinc-500 hover:text-blue-400'
                )}
              />
            </Button>
          ) : (
            <Button
              variant={noBorder ? "ghost" : "outline"}
              className={cn(
                "w-full justify-start hover:bg-zinc-800/50",
                !noBorder && "bg-zinc-900/50 border-zinc-800",
                "text-zinc-100"
              )}
              role="combobox"
              aria-expanded={isOpen}
              type="button"
            >
              {selectedTags.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {selectedTags.map((tag) => (
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
        <PopoverContent
          className="w-[300px] p-3 bg-zinc-900 border-zinc-700"
          align="start"
          sideOffset={5}
        >
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
                type="button"
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
                    type="button"
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

            <ScrollArea className="h-[200px] overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="p-2 text-sm text-zinc-400">
                  タグが見つかりません
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => void handleSelect(tag)}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-zinc-800",
                        selectedTags.some((selected) => selected.id === tag.id) && "bg-zinc-800"
                      )}
                    >
                      <ColoredTag tag={tag} className="text-sm" />
                      {selectedTags.some(
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