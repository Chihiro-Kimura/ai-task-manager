import { type ReactElement } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps): ReactElement {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="カテゴリを選択" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="general">一般</SelectItem>
        <SelectItem value="diary">日記</SelectItem>
        <SelectItem value="idea">アイデア</SelectItem>
        <SelectItem value="reference">参考資料</SelectItem>
        <SelectItem value="task_note">タスクメモ</SelectItem>
      </SelectContent>
    </Select>
  );
} 