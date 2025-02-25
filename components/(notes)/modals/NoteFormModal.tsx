'use client';

import { useEffect, type ReactElement } from 'react';

import { AddNoteForm } from '@/components/(notes)/forms/AddNoteForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { NoteWithTags } from '@/types/note';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  note?: NoteWithTags;
}

export default function NoteFormModal({
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
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
            await onSuccess();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
