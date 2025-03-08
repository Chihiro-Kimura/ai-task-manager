'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Plus, Edit, Trash, GripVertical } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type TagColor, TAG_COLOR_THEMES } from '@/lib/constants/colors';
import { cn } from '@/lib/utils/styles';

import { TagSearch, type TagFilters } from './TagSearch';

const PRESET_COLORS = Object.values(TAG_COLOR_THEMES);

interface Tag {
  id: string;
  name: string;
  color?: string;
  parentId?: string;
  children: Tag[];
  level: number;
  path?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    notes: number;
    tasks: number;
  };
}

export function TagHierarchyEditor() {
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<TagColor>(PRESET_COLORS[0]);
  const [draggedTag, setDraggedTag] = useState<Tag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TagFilters>({
    colors: [],
    showUnused: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: tags, isLoading } = useQuery<Tag[]>({
    queryKey: ['tags', 'hierarchy'],
    queryFn: async () => {
      const response = await fetch('/api/tags/hierarchy');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    }
  });

  const createTagMutation = useMutation({
    mutationFn: async (newTag: { name: string; parentId?: string; color: string }) => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag),
      });
      if (!response.ok) throw new Error('Failed to create tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('タグを作成しました');
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async (updatedTag: { id: string; name: string; parentId?: string; color: string }) => {
      const response = await fetch(`/api/tags/${updatedTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTag),
      });
      if (!response.ok) throw new Error('Failed to update tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('タグを更新しました');
    },
  });

  const moveTagMutation = useMutation({
    mutationFn: async ({ tagId, newParentId }: { tagId: string; newParentId?: string }) => {
      const response = await fetch(`/api/tags/${tagId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newParentId }),
      });
      if (!response.ok) throw new Error('Failed to move tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('タグを移動しました');
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const draggedTag = findTagById(tags || [], active.id as string);
    if (draggedTag) {
      setDraggedTag(draggedTag);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeTag = findTagById(tags || [], active.id as string);
      const overTag = findTagById(tags || [], over.id as string);
      
      if (activeTag && overTag) {
        moveTagMutation.mutate({
          tagId: activeTag.id,
          newParentId: overTag.id,
        });
      }
    }
    
    setDraggedTag(null);
  }

  function findTagById(tags: Tag[], id: string): Tag | null {
    for (const tag of tags) {
      if (tag.id === id) return tag;
      if (tag.children) {
        const found = findTagById(tag.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  const filteredTags = useMemo(() => {
    if (!tags) return [];

    let filtered = [...tags];

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(query) ||
        tag.path?.toLowerCase().includes(query)
      );
    }

    // 色フィルター
    if (filters.colors.length > 0) {
      filtered = filtered.filter(tag => {
        if (!tag.color) return false;
        try {
          const color = JSON.parse(tag.color);
          return filters.colors.some(c => {
            const themeColor = TAG_COLOR_THEMES[c];
            return themeColor.bg === color.bg && themeColor.color === color.color;
          });
        } catch {
          return false;
        }
      });
    }

    // 未使用タグフィルター
    if (!filters.showUnused) {
      filtered = filtered.filter(tag => 
        (tag._count?.notes || 0) + (tag._count?.tasks || 0) > 0
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'usage':
          const aCount = (a._count?.notes || 0) + (a._count?.tasks || 0);
          const bCount = (b._count?.notes || 0) + (b._count?.tasks || 0);
          comparison = aCount - bCount;
          break;
        case 'created':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tags, searchQuery, filters]);

  const rootTags = useMemo(() => 
    filteredTags.filter(tag => !tag.parentId),
    [filteredTags]
  );

  const allTagIds = useMemo(() => 
    filteredTags.map(tag => tag.id),
    [filteredTags]
  );

  function TagNode({ tag, level = 0 }: { tag: Tag; level?: number }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = tag.children && tag.children.length > 0;
    let tagColor: TagColor | null = null;
    
    try {
      if (tag.color) {
        tagColor = JSON.parse(tag.color);
      }
    } catch (e) {
      console.error('Failed to parse tag color:', e);
    }

    return (
      <div className="w-full">
        <div className={cn(
          "flex items-center gap-2 p-2 hover:bg-accent rounded-md",
          selectedTag?.id === tag.id && "bg-accent"
        )}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn("w-4 h-4", !hasChildren && "invisible")}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <Badge
              variant="secondary"
              className="flex-1 cursor-pointer justify-start"
              style={{
                backgroundColor: tagColor?.bg || 'rgb(63 63 70 / 0.5)',
                color: tagColor?.color || 'rgb(161 161 170)',
                borderColor: tagColor ? `${tagColor.color}20` : 'rgb(63 63 70 / 0.2)',
              }}
              onClick={() => setSelectedTag(tag)}
            >
              {tag.name}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedTag(tag);
                if (tag.color) {
                  try {
                    setSelectedColor(JSON.parse(tag.color));
                  } catch (e) {
                    console.error('Failed to parse tag color:', e);
                  }
                }
                setIsEditing(true);
              }}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedTag(tag);
                // 削除確認ダイアログを表示
              }}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6">
            {tag.children.map((child) => (
              <TagNode key={child.id} tag={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">タグ階層</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              新規タグ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規タグの作成</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTagMutation.mutate({
                  name: formData.get('name') as string,
                  parentId: selectedTag?.id,
                  color: JSON.stringify(selectedColor),
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">タグ名</label>
                <Input name="name" placeholder="タグ名" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">タグの色</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((presetColor, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedColor(presetColor)}
                      className={cn(
                        "p-2 rounded-md border-2 transition-all",
                        JSON.stringify(selectedColor) === JSON.stringify(presetColor)
                          ? "border-primary"
                          : "border-transparent hover:border-muted"
                      )}
                    >
                      <Badge
                        variant="secondary"
                        className="w-full"
                        style={{
                          backgroundColor: presetColor.bg,
                          color: presetColor.color,
                        }}
                      >
                        {presetColor.name}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit">作成</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <TagSearch
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
      />

      <div className="border rounded-lg p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allTagIds} strategy={verticalListSortingStrategy}>
            {rootTags.map((tag) => (
              <TagNode key={tag.id} tag={tag} />
            ))}
          </SortableContext>

          <DragOverlay>
            {draggedTag ? (
              <div className="w-64 opacity-80">
                <TagNode tag={draggedTag} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* タグ編集ダイアログ */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグの編集</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedTag) return;
              const formData = new FormData(e.currentTarget);
              updateTagMutation.mutate({
                id: selectedTag.id,
                name: formData.get('name') as string,
                parentId: selectedTag.parentId,
                color: JSON.stringify(selectedColor),
              });
              setIsEditing(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">タグ名</label>
              <Input
                name="name"
                defaultValue={selectedTag?.name}
                placeholder="タグ名"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">タグの色</label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((presetColor, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedColor(presetColor)}
                    className={cn(
                      "p-2 rounded-md border-2 transition-all",
                      JSON.stringify(selectedColor) === JSON.stringify(presetColor)
                        ? "border-primary"
                        : "border-transparent hover:border-muted"
                    )}
                  >
                    <Badge
                      variant="secondary"
                      className="w-full"
                      style={{
                        backgroundColor: presetColor.bg,
                        color: presetColor.color,
                      }}
                    >
                      {presetColor.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit">更新</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 