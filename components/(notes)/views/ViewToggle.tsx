'use client';

import { Grid2X2, List } from 'lucide-react';
import { type ReactElement } from 'react';

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';

interface ViewToggleProps {
  value: 'grid' | 'table';
  onChange: (value: 'grid' | 'table') => void;
}

export function ViewToggle({
  value,
  onChange,
}: ViewToggleProps): ReactElement {
  return (
    <ToggleGroup type="single" value={value} onValueChange={onChange}>
      <ToggleGroupItem value="grid" aria-label="グリッドビュー">
        <Grid2X2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="テーブルビュー">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
} 