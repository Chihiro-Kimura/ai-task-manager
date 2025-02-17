interface LoadingStateProps {
  message?: string;
  className?: string;
  fullHeight?: boolean;
}

export default function LoadingState({
  message = '読み込み中...',
  className = '',
  fullHeight = true,
}: LoadingStateProps) {
  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-black ${
        fullHeight ? 'h-[80vh]' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-2 text-zinc-400">
        <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
