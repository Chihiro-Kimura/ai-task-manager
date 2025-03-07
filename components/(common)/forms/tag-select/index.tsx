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
  placeholder?: string;
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
  placeholder = 'タグを選択...',
}: TagSelectProps): ReactElement {
  if (isLoading) {
    return <TagSelectSkeleton />;
  }

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
      placeholder={placeholder}
    />
  );
} 