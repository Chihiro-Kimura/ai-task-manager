import { Metadata } from 'next';
import { type ReactElement } from 'react';

import { TagManager } from '@/components/(notes)/tags/TagManager';

export const metadata: Metadata = {
  title: 'タグ管理 | AI Task Manager',
  description: 'タスクとメモのタグを一元管理します。',
};

export default function TagsPage(): ReactElement {
  return (
    <div className="container mx-auto ">
      <div className="max-w-3xl mx-auto">
        <TagManager />
      </div>
    </div>
  );
} 