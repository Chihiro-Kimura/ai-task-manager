import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getRandomTagColor } from './constants/colors';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { getRandomTagColor as getRandomColor };
