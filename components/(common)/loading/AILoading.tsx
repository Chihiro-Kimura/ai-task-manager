import { type ReactElement } from 'react';

interface AILoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function AILoading({
  size = 'md',
  text = '処理中...',
  className = '',
}: AILoadingProps): ReactElement {
  const sizeClasses = {
    sm: 'h-3 w-3 border-2',
    md: 'h-4 w-4 border-2',
    lg: 'h-8 w-8 border-4',
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div
        className={`animate-spin rounded-full border-zinc-400 border-t-transparent ${sizeClasses[size]}`}
      />
      {text && <span className="text-sm text-zinc-400">{text}</span>}
    </div>
  );
} 