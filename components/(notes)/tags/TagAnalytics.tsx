'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TagAnalytics {
  tagId: string;
  tagName: string;
  totalUsage: number;
  notesCount: number;
  tasksCount: number;
  lastUsed: string;
}

export function TagAnalytics() {
  const { data: analytics, isLoading } = useQuery<TagAnalytics[]>({
    queryKey: ['tagAnalytics'],
    queryFn: async () => {
      const response = await fetch('/api/tags/analytics');
      if (!response.ok) throw new Error('Failed to fetch tag analytics');
      return response.json();
    }
  });

  if (isLoading) return <Skeleton className="w-full h-[400px]" />;

  return (
    <Card className="p-6">
      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage">使用頻度</TabsTrigger>
          <TabsTrigger value="distribution">タグ分布</TabsTrigger>
          <TabsTrigger value="timeline">時系列</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tagName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalUsage" fill="#8884d8" name="総使用回数" />
              <Bar dataKey="notesCount" fill="#82ca9d" name="ノート数" />
              <Bar dataKey="tasksCount" fill="#ffc658" name="タスク数" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        {/* 他のタブコンテンツは必要に応じて実装 */}
      </Tabs>
    </Card>
  );
} 