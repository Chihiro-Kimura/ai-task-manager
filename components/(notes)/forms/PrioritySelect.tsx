import { type ReactElement } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PrioritySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PrioritySelect({ value, onChange }: PrioritySelectProps): ReactElement {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="優先度を選択" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="高">高</SelectItem>
        <SelectItem value="中">中</SelectItem>
        <SelectItem value="低">低</SelectItem>
      </SelectContent>
    </Select>
  );
} 