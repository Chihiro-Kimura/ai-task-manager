import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export default function EmptyState({
  hasFilters,
  onResetFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-zinc-400">
      <p className="mb-4">
        {hasFilters
          ? 'フィルタに一致するタスクがありません'
          : 'タスクがありません'}
      </p>
      {hasFilters && (
        <Button
          variant="outline"
          onClick={onResetFilters}
          className="bg-zinc-950 border-zinc-800"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          フィルタをリセット
        </Button>
      )}
    </div>
  );
}
