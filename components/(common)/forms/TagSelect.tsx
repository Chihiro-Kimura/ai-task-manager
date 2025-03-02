'use client';

import { Tag as TagIcon } from 'lucide-react';
import { type ReactElement, useEffect, useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface TagSelectProps {
  id?: string;
  type?: 'task' | 'note';
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  className?: string;
  variant?: 'default' | 'icon';
}

export default function TagSelect({
  id,
  type = 'task',
  selectedTags,
  onTagsChange,
  className,
  variant = 'default',
}: TagSelectProps): ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const currentSelectedTags = selectedTags ?? [];

  const fetchTags = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('タグの取得に失敗しました');
      }
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTags = async (newTags: Tag[]): Promise<void> => {
    try {
      if (!id) {
        onTagsChange(newTags);
        return;
      }

      const endpoint = type === 'task' 
        ? `/api/tasks/${id}/tags`
        : `/api/notes/${id}/tags`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: newTags.map((tag) => tag.id),
        }),
      });

      if (!response.ok) {
        throw new Error('タグの更新に失敗しました');
      }

      const updatedTags = await response.json();
      onTagsChange(updatedTags);
      
      void fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    }
  };

  useEffect(() => {
    void fetchTags();
  }, []);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  const handleSelect = (tagId: string): void => {
    const selectedTag = tags.find((tag) => tag.id === tagId);
    if (!selectedTag) return;

    const isAlreadySelected = currentSelectedTags.some((tag) => tag.id === tagId);
    const newTags = isAlreadySelected
      ? currentSelectedTags.filter((tag) => tag.id !== tagId)
      : [...currentSelectedTags, selectedTag];

    void updateTags(newTags);
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
                    <span
                      key={tag.id}
                      className="flex items-center gap-1.5 bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-sm"
                    >
                      {tag.color && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-zinc-400">タグを選択...</span>
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-3 bg-zinc-900 border-zinc-700">
          <div className="space-y-2">
            <Input
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="p-2 text-sm text-zinc-400">読み込み中...</div>
              ) : error ? (
                <div className="p-2 text-sm text-red-400">{error}</div>
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
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-zinc-800 ${
                        currentSelectedTags.some(
                          (selected) => selected.id === tag.id
                        )
                          ? 'bg-zinc-800'
                          : ''
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {tag.color && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        {tag.name}
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