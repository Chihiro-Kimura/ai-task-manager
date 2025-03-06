'use client';

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
import { useTagManagement } from '@/hooks/use-tag-management';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/styles';
import { Tag } from '@/types/common';

interface TagSelectProps {
  id?: string;
  type?: 'task' | 'note';
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  suggestedTags?: string[];
  className?: string;
  variant?: 'default' | 'icon';
  noBorder?: boolean;
}

export default function TagSelect({
  id,
  type = 'task',
  selectedTags,
  onTagsChange,
  suggestedTags = [],
  className,
  variant = 'default',
  noBorder = false,
}: TagSelectProps): ReactElement {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  const {
    tags,
    isLoading,
    createNewTag,
    loadTags,
  } = useTagManagement({
    id,
    type,
    initialTags: selectedTags,
    onTagsChange,
  });

  // 提案されたタグがある場合は自動的にポップオーバーを開く
  useEffect(() => {
    if (suggestedTags?.length > 0) {
      setIsOpen(true);
    }
  }, [suggestedTags]);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const handleCreateTag = async (): Promise<void> => {
    if (!newTagName.trim()) return;

    try {
      setIsCreating(true);
      const newTag = await createNewTag(newTagName.trim());
      if (newTag) {
        // 既存のタグと重複していない場合のみ追加
        if (!selectedTags.some(tag => tag.id === newTag.id)) {
          onTagsChange([...selectedTags, newTag]);
        }
        setNewTagName('');
        setShowNewTagInput(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = async (tagId: string): Promise<void> => {
    try {
      if (tagId.startsWith('suggested-')) {
        const tagName = tagId.replace('suggested-', '');
        // 既存のタグを検索（大文字小文字を区別しない）
        const existingTag = tags.find(
          tag => tag.name.toLowerCase() === tagName.toLowerCase()
        );

        if (existingTag) {
          // 既存のタグが見つかった場合、それを使用
          if (!selectedTags.some(tag => tag.id === existingTag.id)) {
            onTagsChange([...selectedTags, existingTag]);
          }
          return;
        }

        // 既存のタグが見つからない場合のみ新規作成
        const newTag = await createNewTag(tagName);
        if (newTag) {
          if (!selectedTags.some(tag => tag.id === newTag.id)) {
            onTagsChange([...selectedTags, newTag]);
          }
        }
        return;
      }

      // 既存のタグの選択/解除
      const selectedTag = tags.find((tag) => tag.id === tagId);
      if (!selectedTag) return;

      const isSelected = selectedTags.some((tag) => tag.id === tagId);
      const updatedTags = isSelected
        ? selectedTags.filter((tag) => tag.id !== tagId)
        : [...selectedTags, selectedTag];
      
      onTagsChange(updatedTags);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'タグの作成に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    
    if (searchQuery) {
      return tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 提案されたタグが存在しない場合は全てのタグを表示
    if (!suggestedTags?.length) {
      return tags;
    }

    // 提案されたタグを優先的に表示
    const suggestedTagsLower = suggestedTags.map(tag => tag.toLowerCase());
    
    // 既存のタグから提案されたタグと一致するものを探す
    const existingSuggested = tags.filter(tag => 
      suggestedTagsLower.includes(tag.name.toLowerCase())
    );

    // 既存のタグに存在しない提案タグを仮想的なタグとして作成
    const newSuggestedTags = suggestedTags
      .filter(suggestedName => 
        !tags.some(tag => tag.name.toLowerCase() === suggestedName.toLowerCase())
      )
      .map(name => ({
        id: `suggested-${name}`,
        name,
        color: null,
        userId: '',
        createdAt: new Date()
      } as Tag));

    // その他の既存のタグ
    const others = tags.filter(tag => 
      !suggestedTagsLower.includes(tag.name.toLowerCase())
    );

    return [...newSuggestedTags, ...existingSuggested, ...others];
  }, [tags, searchQuery, suggestedTags]);

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