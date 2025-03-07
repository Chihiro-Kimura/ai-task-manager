import { type ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { type TagColor } from '@/lib/constants/colors';
import { cn } from '@/lib/utils/styles';
import { Tag } from '@/types/common';

interface ColoredTagProps {
  tag: Tag;
  className?: string;
}

export function ColoredTag({ tag, className }: ColoredTagProps): ReactElement {
  let tagColor: TagColor | null = null;
  try {
    if (tag.color) {
      tagColor = typeof tag.color === 'string' ? JSON.parse(tag.color) : tag.color;
    }
  } catch (e) {
    console.error('Failed to parse tag color:', e);
  }

  // 提案されたタグの場合のデフォルトスタイル
  const isSuggestedTag = tag.id.startsWith('suggested-');
  const defaultStyle = isSuggestedTag
    ? {
        backgroundColor: 'rgb(59 130 246 / 0.1)',
        color: 'rgb(96 165 250)',
        borderColor: 'rgb(59 130 246 / 0.2)',
      }
    : {
        backgroundColor: 'rgb(63 63 70 / 0.5)',
        color: 'rgb(161 161 170)',
        borderColor: 'rgb(63 63 70 / 0.2)',
      };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'border text-xs px-1.5 py-0 min-h-[18px] transition-colors duration-200',
        className
      )}
      style={{
        backgroundColor: tagColor?.bg || defaultStyle.backgroundColor,
        color: tagColor?.color || defaultStyle.color,
        borderColor: tagColor ? `${tagColor.color}20` : defaultStyle.borderColor,
      }}
    >
      {tag.name}
    </Badge>
  );
} 