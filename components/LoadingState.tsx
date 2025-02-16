export default function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[80vh] text-zinc-400">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
        <span>読み込み中...</span>
      </div>
    </div>
  );
}
