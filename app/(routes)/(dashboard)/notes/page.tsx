import { Metadata } from 'next';

import NoteList from '@/components/(notes)/list/NoteList';

export const metadata: Metadata = {
  title: 'メモ一覧 | AI Task Manager',
  description:
    'タグ付きメモを管理し、AIによる自動タグ付けと優先度提案を活用できます。',
};

export default function NotesPage(): JSX.Element {
  return (
    <div className="container mx-auto py-6">
      <NoteList />
    </div>
  );
}
