'use client';

import { LayoutGrid, List, ListTodo } from 'lucide-react';
import { type ReactElement, useState, useEffect } from 'react';


import KanbanView from '@/components/(tasks)/views/KanbanView';
import ListView from '@/components/(tasks)/views/ListView';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useMediaQuery } from '@/hooks/use-media-query';

type ViewType = 'kanban' | 'list';

interface TaskListProps {
  view?: ViewType;
}

export default function TaskList({
  view = 'kanban',
}: TaskListProps): ReactElement {
  const [currentView, setCurrentView] = useState<ViewType>(view);
  const isDesktop = useMediaQuery('(min-width: 640px)');

  useEffect(() => {
    if (!isDesktop) {
      setCurrentView('list');
    } else {
      setCurrentView('kanban');
    }
  }, [isDesktop]);

  return (
    <div className="p-4 bg-zinc-950 rounded-lg min-h-[80vh] max-h-[85vh] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-100">
            <ListTodo className="h-5 w-5" />
            タスク一覧
          </h2>
          {isDesktop && (
          <ToggleGroup
            type="single"
            value={currentView}
            onValueChange={(value) => value && setCurrentView(value as ViewType)}
          >
            <ToggleGroupItem value="kanban" asChild>
              <Button
                variant={currentView === 'kanban' ? 'default' : 'outline'}
                size="sm"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                カンバン
              </Button>
            </ToggleGroupItem>
            <ToggleGroupItem value="list" asChild>
              <Button
                variant={currentView === 'list' ? 'default' : 'outline'}
                size="sm"
              >
                <List className="h-4 w-4 mr-2" />
                リスト
              </Button>
            </ToggleGroupItem>
          </ToggleGroup>
          )}
        </div>
      </div>

      {(!isDesktop || currentView === 'list') ? <ListView /> : <KanbanView />}
    </div>
  );
}
