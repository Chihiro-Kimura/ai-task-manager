'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type TagColor, TAG_COLOR_THEMES } from '@/lib/constants/colors';

interface TagSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: TagFilters) => void;
}

export interface TagFilters {
  colors: string[];
  showUnused: boolean;
  sortBy: 'name' | 'usage' | 'created' | 'updated';
  sortOrder: 'asc' | 'desc';
}

const SORT_OPTIONS = {
  name: '名前',
  usage: '使用頻度',
  created: '作成日',
  updated: '更新日',
} as const;

export function TagSearch({ onSearch, onFilterChange }: TagSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState<TagFilters>({
    colors: [],
    showUnused: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleFilterChange = (newFilters: Partial<TagFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleColor = (color: string) => {
    const colors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    handleFilterChange({ colors });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="タグを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>フィルターとソート</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="p-2 space-y-4">
              {/* 色フィルター */}
              <div className="space-y-2">
                <Label>色</Label>
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(TAG_COLOR_THEMES).map(([key, color]) => (
                    <button
                      key={key}
                      onClick={() => toggleColor(key)}
                      className={`p-1 rounded-md border-2 transition-all ${
                        filters.colors.includes(key)
                          ? 'border-primary'
                          : 'border-transparent'
                      }`}
                    >
                      <Badge
                        variant="secondary"
                        className="w-full"
                        style={{
                          backgroundColor: color.bg,
                          color: color.color,
                        }}
                      >
                        {color.name}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* 未使用タグの表示 */}
              <div className="flex items-center justify-between">
                <Label>未使用のタグを表示</Label>
                <Switch
                  checked={filters.showUnused}
                  onCheckedChange={(checked) =>
                    handleFilterChange({ showUnused: checked })
                  }
                />
              </div>

              {/* ソート */}
              <div className="space-y-2">
                <Label>並び替え</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                    <Button
                      key={value}
                      variant={filters.sortBy === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        handleFilterChange({
                          sortBy: value as TagFilters['sortBy'],
                        })
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange({ sortOrder: 'asc' })}
                  >
                    昇順
                  </Button>
                  <Button
                    variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange({ sortOrder: 'desc' })}
                  >
                    降順
                  </Button>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 