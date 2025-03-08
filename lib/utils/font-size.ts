import { type FontSize } from '@/store/settings-store';

const fontSizeClasses: Record<FontSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

export function getFontSizeClass(size: FontSize): string {
  return fontSizeClasses[size];
}

export function applyFontSize(size: FontSize): void {
  const root = document.documentElement;
  Object.values(fontSizeClasses).forEach((className) => {
    root.classList.remove(className);
  });
  root.classList.add(fontSizeClasses[size]);
} 