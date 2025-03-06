import { type ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export function TagSelectSkeleton(): ReactElement {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full bg-zinc-800/50" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 bg-zinc-800/50" />
        <Skeleton className="h-6 w-20 bg-zinc-800/50" />
        <Skeleton className="h-6 w-20 bg-zinc-800/50" />
      </div>
    </div>
  );
} 