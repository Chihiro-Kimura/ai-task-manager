'use client';

import { type ReactElement, useEffect } from 'react';

import { AddNoteForm } from '@/components/(notes)/forms/AddNoteForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoteWithTags } from '@/types/note';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
  note?: NoteWithTags;
}

export function NoteFormModal({
  isOpen,
  onClose,
  onSuccess,
  note,
}: NoteFormModalProps): ReactElement {
  // モーダルが閉じられたときにフォームをリセット
  useEffect(() => {
    if (!isOpen) {
      // フォームのリセットは各フォームコンポーネントで行う
    }
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // ヘルプパネルがクリックされた場合は閉じない
        const helpPanel = document.querySelector('[data-help-panel]');
        const activeElement = document.activeElement;
        if (helpPanel?.contains(activeElement)) {
          return;
        }
        onClose();
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[role="dialog"]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{note ? 'メモを編集' : '新規メモ'}</DialogTitle>
          <DialogDescription>
            {note
              ? 'メモの内容を編集してください。'
              : '新しいメモを作成します。'}
          </DialogDescription>
        </DialogHeader>
        <AddNoteForm
          note={note}
          onSuccess={async () => {
            await onSuccess?.();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
