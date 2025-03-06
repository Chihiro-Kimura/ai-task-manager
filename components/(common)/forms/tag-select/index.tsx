'use client';

import { type ReactElement, useEffect } from 'react';

import { Tag } from '@/types/common';

import { TagSelectClient } from './client';
import { TagSelectSkeleton } from './skeleton';

interface TagSelectProps {
  id?: string;
  type?: 'task' | 'note';
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  variant?: 'default' | 'icon';
  noBorder?: boolean;
  className?: string;
  initialTags?: Tag[];
  isLoading?: boolean;
}

export default function TagSelect({
  id,
  type = 'task',
  selectedTags,
  onTagsChange,
  variant = 'default',
  noBorder = false,
  className,
  initialTags = [],
  isLoading = false,
}: TagSelectProps): ReactElement {
  // コンポーネントのマウント時の状態をログ
  useEffect(() => {
    console.log('[TagSelect] Component mounted:', {
      id,
      type,
      selectedTags,
      initialTags,
      isLoading
    });
  }, []);

  // propsの変更を監視
  useEffect(() => {
    console.log('[TagSelect] Props updated:', {
      id,
      type,
      selectedTagsCount: selectedTags.length,
      initialTagsCount: initialTags.length,
      selectedTags,
      initialTags,
      isLoading
    });
  }, [id, type, selectedTags, initialTags, isLoading]);

  if (isLoading) {
    console.log('[TagSelect] Rendering skeleton');
    return <TagSelectSkeleton />;
  }

  console.log('[TagSelect] Rendering client component with:', {
    id,
    type,
    selectedTags,
    initialTags,
    isLoading
  });

  return (
    <TagSelectClient
      id={id}
      type={type}
      initialTags={initialTags}
      selectedTags={selectedTags}
      onTagsChange={onTagsChange}
      variant={variant}
      noBorder={noBorder}
      className={className}
    />
  );
} 