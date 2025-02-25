'use client';

import { Tag } from '@prisma/client';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import useSWR from 'swr';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import TagFormModal from './TagFormModal';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function TagManager(): JSX.Element {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();

  // useSWRを使用してタグを取得
  const {
    data: tags,
    error,
    mutate: mutateTags,
  } = useSWR<Tag[]>(
    session?.user?.id ? '/api/tags' : null,
    async (url: string) => {
      if (!session?.user?.id) return [];

      if (isDevelopment) {
        console.log('🔍 Fetching tags for user:', session.user.id);
      }

      const response = await fetch(url, {
        headers: {
          'X-User-Id': session.user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      if (isDevelopment) {
        console.log('✅ Tags fetched:', data.length);
      }
      return data;
    }
  );

  const handleAddTag = (): void => {
    setSelectedTag(undefined);
    setIsModalOpen(true);
  };

  const handleEditTag = (tag: Tag): void => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleDeleteTag = async (tag: Tag): Promise<void> => {
    if (
      !confirm(
        'このタグを削除してもよろしいですか？\n関連付けられたメモからもタグが削除されます。'
      )
    )
      return;

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }

      toast({
        title: 'タグを削除しました',
        variant: 'default',
      });

      await mutateTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast({
        title: 'タグの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="text-red-500">
        タグの読み込みに失敗しました。再読み込みしてください。
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">タグ管理</CardTitle>
          <Button
            onClick={handleAddTag}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            新規タグ
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tags?.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-lg border border-zinc-800 bg-zinc-900"
              >
                <Badge
                  variant="secondary"
                  className="bg-zinc-800 text-zinc-300"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditTag(tag)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTag(tag)}
                    className="h-8 w-8 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {tags?.length === 0 && (
              <p className="text-zinc-500 text-center py-4">
                タグがありません。新規タグを作成してください。
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <TagFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTag(undefined);
        }}
        onSuccess={async () => {
          await mutateTags();
        }}
        tag={selectedTag}
      />
    </>
  );
}
