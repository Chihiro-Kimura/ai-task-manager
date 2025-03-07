'use client';

import { ArrowDownAZ, ArrowUpAZ, Calendar, Search, SortAsc } from 'lucide-react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Priority } from '@/types/common';
import { NoteFilter } from '@/types/note';

import { FilterSelect } from './FilterSelect';

interface NoteFilterBarProps {
  filter: NoteFilter;
  onFilterChange: (filter: NoteFilter) => void;
}

export function NoteFilterBar({
  filter,
  onFilterChange,
}: NoteFilterBarProps): ReactElement {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filter, search: value });
  };

  const handlePriorityChange = (priorities: string[]) => {
    onFilterChange({ ...filter, priority: priorities as Priority[] });
  };

  const handleSortChange = (sort: string) => {
    onFilterChange({ ...filter, sort });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="メモを検索..."
          value={filter.search ?? ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <FilterSelect
        label="優先度"
        options={[
          { label: '高', value: '高' },
          { label: '中', value: '中' },
          { label: '低', value: '低' },
        ]}
        value={filter.priority ?? []}
        onChange={handlePriorityChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 lg:flex"
          >
            <SortAsc className="mr-2 h-4 w-4" />
            {filter.sort === 'title'
              ? 'タイトル'
              : filter.sort === '-createdAt'
                ? '新しい順'
                : filter.sort === 'createdAt'
                  ? '古い順'
                  : 'ソート'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuItem onClick={() => handleSortChange('title')}>
            <ArrowDownAZ className="mr-2 h-4 w-4" />
            タイトル
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('-createdAt')}>
            <Calendar className="mr-2 h-4 w-4" />
            新しい順
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('createdAt')}>
            <Calendar className="mr-2 h-4 w-4" />
            古い順
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 