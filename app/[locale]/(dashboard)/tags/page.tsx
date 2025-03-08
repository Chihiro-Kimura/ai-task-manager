import { Metadata } from 'next';

import { TagAnalytics } from '@/components/(notes)/tags/TagAnalytics';
import { TagHierarchyEditor } from '@/components/(notes)/tags/TagHierarchyEditor';

export const metadata: Metadata = {
  title: 'タグ管理 | AI Task Manager',
  description: 'タスクとメモのタグを階層的に管理します。',
};

export default function TagsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">タグ管理</h2>
          <p className="text-sm text-muted-foreground">
            タグの階層構造を管理し、分析情報を確認できます。
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <TagHierarchyEditor />
        <TagAnalytics />
      </div>
    </div>
  );
} 