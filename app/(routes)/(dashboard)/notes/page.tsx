import { Metadata } from 'next';
import { type ReactElement } from 'react';

import NoteList from '@/components/(notes)/list/NoteList';
import { TagManager } from '@/components/(notes)/tags/TagManager';

export const metadata: Metadata = {
  title: 'メモ一覧 | AI Task Manager',
  description:
    'タグ付きメモを管理し、AIによる自動タグ付けと優先度提案を活用できます。',
};

export default function NotesPage(): ReactElement {
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <NoteList />
        </div>
        <div className="lg:col-span-1">
          <TagManager />
        </div>
      </div>
    </div>
  );
}
