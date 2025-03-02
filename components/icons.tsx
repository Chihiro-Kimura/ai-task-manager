import {
  AlertCircle,
  FileText,
  Folder,
  Lightbulb,
  type LucideIcon,
  Sparkles,
  Tag,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  fileText: FileText,
  tag: Tag,
  alertCircle: AlertCircle,
  folder: Folder,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
} as const;
