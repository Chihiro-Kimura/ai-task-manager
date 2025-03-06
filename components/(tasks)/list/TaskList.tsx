'use client';

import { LayoutGrid, List } from 'lucide-react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/taskStore';

import KanbanView from '../views/KanbanView';
import ListView from '../views/ListView';

export default function TaskList(): ReactElement {
  const { viewMode, setViewMode } = useTaskStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 px-4">
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${
              viewMode === 'kanban'
                ? 'bg-zinc-800 text-zinc-200'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
            カンバン
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-zinc-800 text-zinc-200'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
            リスト
          </Button>
        </div>
      </div>
      {viewMode === 'list' ? <ListView /> : <KanbanView />}
    </div>
  );
}
