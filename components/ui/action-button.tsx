'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ButtonHTMLAttributes, type ReactElement } from 'react';

import { cn } from '@/lib/utils/styles';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'default' | 'lg';
};

export function EditButton({
  className,
  size = 'default',
  ...props
}: ActionButtonProps): ReactElement {
  return (
    <button
      className={cn(
        'h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        'bg-zinc-900/80 hover:bg-blue-900/80 text-zinc-400 hover:text-blue-400',
        size === 'sm' && 'h-5 w-5',
        className
      )}
      {...props}
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}

export function DeleteButton({
  className,
  size = 'default',
  ...props
}: ActionButtonProps): ReactElement {
  return (
    <button
      className={cn(
        'h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        'bg-zinc-900/80 hover:bg-rose-900/80 text-zinc-400 hover:text-rose-400',
        size === 'sm' && 'h-5 w-5',
        className
      )}
      {...props}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function AddButton({
  className,
  size = 'default',
  ...props
}: ActionButtonProps): ReactElement {
  return (
    <button
      className={cn(
        'h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        'bg-zinc-900/80 hover:bg-emerald-900/80 text-zinc-400 hover:text-emerald-400',
        size === 'sm' && 'h-5 w-5',
        className
      )}
      {...props}
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}
