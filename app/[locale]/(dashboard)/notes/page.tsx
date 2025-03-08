import { type Metadata } from 'next';
import { type ReactElement } from 'react';

import NoteList from '@/components/(notes)/NoteList';

export const metadata: Metadata = {
  title: 'メモ一覧 - AI Task Manager',
  description: 'メモの一覧を表示し、管理することができます。',
};

export default function NotesPage(): ReactElement {
  return (
    <div className="container mx-auto py-6">
      <NoteList />
    </div>
  );
}
