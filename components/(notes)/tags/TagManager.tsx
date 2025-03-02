'use client';

import { Tag } from '@prisma/client';
import { Edit2, Plus, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type JSX, useState } from 'react';
import useSWR from 'swr';

import LoadingState from '@/components/(common)/loading/LoadingState';
import {
  AddButton,
  DeleteButton,
  EditButton,
} from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type TagColor, getTagOpacity } from '@/lib/constants/colors';
import { TAG_MESSAGES } from '@/lib/constants/messages';
import { getRandomColor } from '@/lib/utils';
import { deleteTag, fetchTags } from '@/lib/utils/tag';

import { TagFormModal } from './TagFormModal';

const isDevelopment = process.env.NODE_ENV === 'development';

interface TagManagerProps {
  tags?: Tag[];
  onTagCreate?: (tag: Tag) => void;
  onTagUpdate?: (tag: Tag) => void;
  onTagDelete?: (tagId: string) => void;
}

export function TagManager({
  tags: _tags,
  onTagCreate: _onTagCreate,
  onTagUpdate: _onTagUpdate,
  onTagDelete: _onTagDelete,
}: TagManagerProps = {}): JSX.Element {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const {
    data: tagsData,
    error,
    mutate: mutateTags,
  } = useSWR<(Tag & { _count?: { notes: number } })[]>(
    session?.user?.id ? '/api/tags' : null,
    async () => {
      if (!session?.user?.id) return [];
      return fetchTags();
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
      await deleteTag(tag.id);

      toast({
        title: TAG_MESSAGES.DELETE_SUCCESS,
      });

      await mutateTags();
    } catch {
      toast({
        title: 'エラー',
        description: TAG_MESSAGES.DELETE_ERROR,
        variant: 'destructive',
      });
    }
  };

  const handleToggleTag = (tagId: string): void => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const handleToggleAll = (): void => {
    if (!tagsData) return;

    if (selectedTags.size === tagsData.length) {
      setSelectedTags(new Set());
    } else {
      setSelectedTags(new Set(tagsData.map((tag) => tag.id)));
    }
  };

  const handleDeleteSelected = async (): Promise<void> => {
    if (selectedTags.size === 0) return;

    if (
      !confirm(
        `選択した${selectedTags.size}個のタグを削除してもよろしいですか？\n関連付けられたメモからもタグが削除されます。`
      )
    )
      return;

    try {
      await Promise.all(
        Array.from(selectedTags).map((tagId) => deleteTag(tagId))
      );

      toast({
        title: `${selectedTags.size}個のタグを削除しました`,
      });

      setSelectedTags(new Set());
      await mutateTags();
    } catch {
      toast({
        title: 'エラー',
        description: TAG_MESSAGES.DELETE_ERROR,
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

  if (!tagsData) {
    return <LoadingState message="タグを読み込み中..." fullHeight={false} />;
  }

  const hasSelectedTags = selectedTags.size > 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-semibold text-zinc-100">
              タグ管理
            </CardTitle>
            {hasSelectedTags && (
              <span className="text-sm text-zinc-400">
                {selectedTags.size}個選択中
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasSelectedTags ? (
              <Button
                onClick={handleDeleteSelected}
                variant="ghost"
                size="sm"
                className="h-8 text-red-500 hover:text-red-400"
              >
                <Trash className="h-4 w-4 mr-1" />
                削除
              </Button>
            ) : (
              <AddButton onClick={handleAddTag} title="タグを追加">
                <Plus className="h-4 w-4" />
              </AddButton>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {tagsData && tagsData.length > 0 && (
              <div className="flex items-center gap-2 py-1 border-b border-zinc-800">
                <Checkbox
                  id="select-all"
                  checked={tagsData.length === selectedTags.size}
                  onCheckedChange={handleToggleAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm text-zinc-400 cursor-pointer select-none"
                >
                  すべて選択
                </label>
              </div>
            )}
            {tagsData?.map((tag) => {
              let tagColor: TagColor | null = null;
              try {
                if (tag.color) {
                  tagColor = JSON.parse(tag.color) as TagColor;
                }
              } catch (e) {
                console.error('Failed to parse tag color:', e);
              }
              const opacity = getTagOpacity(tag._count?.notes || 0);

              return (
                <div
                  key={tag.id}
                  className="group flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.has(tag.id)}
                      onCheckedChange={() => handleToggleTag(tag.id)}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          tagColor?.color || 'rgb(156, 163, 175)',
                        opacity,
                      }}
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm text-zinc-100 cursor-pointer select-none"
                    >
                      {tag.name}
                      {tag._count?.notes ? (
                        <span className="ml-1.5 text-xs text-zinc-500">
                          {tag._count.notes}
                        </span>
                      ) : null}
                    </label>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditButton onClick={() => handleEditTag(tag)} size="sm">
                      <Edit2 className="h-3 w-3" />
                    </EditButton>
                    <DeleteButton
                      onClick={() => handleDeleteTag(tag)}
                      size="sm"
                    >
                      <Trash className="h-3 w-3" />
                    </DeleteButton>
                  </div>
                </div>
              );
            })}
            {!tagsData?.length && (
              <p className="text-sm text-zinc-500 text-center py-2">
                タグがありません
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
        defaultColor={getRandomColor()}
      />
    </>
  );
}
