'use client';
// ドラッグ機能のみを持つ軽量なラッパーコンポーネント

import { Draggable } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DraggableWrapperProps {
  id: string;
  index: number;
  isDragDisabled?: boolean;
  children: ReactNode;
}

export function DraggableWrapper({
  id,
  index,
  isDragDisabled = false,
  children,
}: DraggableWrapperProps) {
  return (
    <Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'cursor-grab active:cursor-grabbing',
            isDragDisabled && 'cursor-default pointer-events-none'
          )}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
}
