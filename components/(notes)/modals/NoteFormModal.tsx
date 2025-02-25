'use client';

import { useEffect } from 'react';

import AddNoteForm from '@/components/(notes)/forms/AddNoteForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoteWithTags } from '@/types/note';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  note?: NoteWithTags; // 編集時のみ使用
}

export default function NoteFormModal({
  isOpen,
  onClose,
  onSuccess,
  note,
}: NoteFormModalProps): JSX.Element {
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
        </DialogHeader>
        <AddNoteForm
          note={note}
          onSuccess={async () => {
            await onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
