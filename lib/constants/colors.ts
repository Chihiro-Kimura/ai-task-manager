export interface TagColor {
  bg: string;
  color: string;
  name: string;
}

export const TAG_COLOR_THEMES: Record<string, TagColor> = {
  red: {
    bg: 'rgba(239, 68, 68, 0.15)',
    color: 'rgb(239, 68, 68)',
    name: 'レッド',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.15)',
    color: 'rgb(249, 115, 22)',
    name: 'オレンジ',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.15)',
    color: 'rgb(245, 158, 11)',
    name: 'アンバー',
  },
  lime: {
    bg: 'rgba(132, 204, 22, 0.15)',
    color: 'rgb(132, 204, 22)',
    name: 'ライム',
  },
  emerald: {
    bg: 'rgba(16, 185, 129, 0.15)',
    color: 'rgb(16, 185, 129)',
    name: 'エメラルド',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.15)',
    color: 'rgb(6, 182, 212)',
    name: 'シアン',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.15)',
    color: 'rgb(59, 130, 246)',
    name: 'ブルー',
  },
  indigo: {
    bg: 'rgba(99, 102, 241, 0.15)',
    color: 'rgb(99, 102, 241)',
    name: 'インディゴ',
  },
  violet: {
    bg: 'rgba(139, 92, 246, 0.15)',
    color: 'rgb(139, 92, 246)',
    name: 'バイオレット',
  },
  pink: {
    bg: 'rgba(236, 72, 153, 0.15)',
    color: 'rgb(236, 72, 153)',
    name: 'ピンク',
  },
} as const;

export const TAG_COLORS = Object.values(TAG_COLOR_THEMES);

export function getRandomTagColor(): TagColor {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

export function getTagOpacity(usageCount: number): number {
  const minOpacity = 0.6;
  const maxOpacity = 1;
  return Math.min(minOpacity + usageCount * 0.1, maxOpacity);
}

export function adjustTagColorOpacity(
  tagColor: TagColor,
  opacity: number
): TagColor {
  const adjustOpacity = (color: string): string => {
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${opacity})`);
    }
    return color;
  };

  return {
    ...tagColor,
    bg: adjustOpacity(tagColor.bg),
  };
}
