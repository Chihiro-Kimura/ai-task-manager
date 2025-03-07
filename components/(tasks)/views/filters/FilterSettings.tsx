'use client';

import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils/styles';
import { type FilterState, type SortConfig } from '@/types/task/table';

interface FilterSettingsProps {
  filters: FilterState;
  sortConfig: SortConfig | null;
  onFilterChange: (columnId: string, values: string[]) => void;
  onSortChange: (columnId: string) => void;
  getFilterOptions: (columnId: string) => Array<{ value: string; label: string }>;
  onClearFilters: () => void;
}

export function FilterSettings({
  filters,
  sortConfig,
  onFilterChange,
  onSortChange,
  getFilterOptions,
  onClearFilters,
}: FilterSettingsProps): ReactElement {
  const filterColumns = ['status', 'priority', 'tags'];
  const sortableColumns = ['title', 'status', 'priority', 'due_date', 'createdAt'];

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {/* フィルター設定 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
            <h3 className="text-sm font-medium">フィルター</h3>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 text-zinc-400 hover:text-zinc-300"
              >
                すべてクリア
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {filterColumns.map((columnId) => (
              <div key={columnId} className="space-y-2">
                <label className="text-sm text-zinc-400">
                  {columnId === 'status' && 'ステータス'}
                  {columnId === 'priority' && '優先度'}
                  {columnId === 'tags' && 'タグ'}
                </label>
                <Command className="rounded-md border border-zinc-800">
                  <CommandInput placeholder="検索..." />
                  <CommandEmpty>オプションが見つかりません</CommandEmpty>
                  <CommandGroup>
                    {getFilterOptions(columnId).map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const currentValues = filters[columnId] || [];
                          const newValues = currentValues.includes(option.value)
                            ? currentValues.filter((v) => v !== option.value)
                            : [...currentValues, option.value];
                          onFilterChange(columnId, newValues);
                        }}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-700',
                            (filters[columnId] || []).includes(option.value)
                              ? 'bg-emerald-500 text-white'
                              : 'opacity-50'
                          )}
                        >
                          {(filters[columnId] || []).includes(option.value) && (
                            <span>✓</span>
                          )}
                        </div>
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* ソート設定 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium sticky top-0 bg-background z-10 py-2">ソート</h3>
          <div className="grid grid-cols-2 gap-2">
            {sortableColumns.map((columnId) => (
              <Button
                key={columnId}
                variant="outline"
                size="sm"
                onClick={() => onSortChange(columnId)}
                className={cn(
                  'justify-start',
                  sortConfig?.key === columnId &&
                    'bg-zinc-800 text-zinc-200'
                )}
              >
                <span className="mr-2">
                  {columnId === 'title' && 'タイトル'}
                  {columnId === 'status' && 'ステータス'}
                  {columnId === 'priority' && '優先度'}
                  {columnId === 'due_date' && '期限'}
                  {columnId === 'createdAt' && '作成日'}
                </span>
                {sortConfig?.key === columnId && (
                  <span className="ml-auto">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
} 