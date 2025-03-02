import { type ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { type TagColor } from '@/lib/constants/colors';

interface ColoredTagProps {
  tag: {
    id: string;
    name: string;
    color: string | null;
  };
  className?: string;
}

export function ColoredTag({ tag, className }: ColoredTagProps): ReactElement {
  let tagColor: TagColor | null = null;
  try {
    if (tag.color) {
      tagColor = JSON.parse(tag.color) as TagColor;
    }
  } catch (e) {
    console.error('Failed to parse tag color:', e);
  }

  return (
    <Badge
      variant="secondary"
      className={`bg-zinc-800 text-zinc-300 ${className || ''}`}
      style={{
        backgroundColor: tagColor?.bg || 'rgba(55, 65, 81, 0.15)',
        color: tagColor?.color || 'rgb(156, 163, 175)',
      }}
    >
      {tag.name}
    </Badge>
  );
} 