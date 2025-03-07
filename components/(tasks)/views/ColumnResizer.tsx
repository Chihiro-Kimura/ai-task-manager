import { type ReactElement, useCallback, useEffect, useState } from 'react';

interface ColumnResizerProps {
  onResize: (width: number) => void;
  minWidth: number;
  maxWidth?: number;
}

export function ColumnResizer({
  onResize,
  minWidth,
  maxWidth = 500,
}: ColumnResizerProps): ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.pageX);
    setStartWidth(e.currentTarget.parentElement?.offsetWidth || 0);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent): void => {
    if (!isDragging) return;

    const diff = e.pageX - startX;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + diff));
    onResize(newWidth);
  }, [isDragging, startX, startWidth, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-zinc-600 ${
        isDragging ? 'bg-zinc-600' : 'bg-transparent'
      }`}
      onMouseDown={handleMouseDown}
    />
  );
} 