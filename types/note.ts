import { Priority, Tag } from './common';

export type NoteType = 'general' | 'diary' | 'idea' | 'reference' | 'task_note';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  priority?: Priority;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  type: NoteType;
  priority?: Priority;
  tags?: string[]; // タグのID配列（オプショナル）
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  type?: NoteType;
  priority?: Priority;
  tags?: string[]; // タグのID配列（オプショナル）
}

export interface NoteWithTags extends Note {
  tags: Tag[];
}

export type NoteSortKey = 'title' | 'createdAt' | '-createdAt';

export interface NoteFilter {
  search?: string;
  priority?: Priority[];
  type?: NoteType[];
  sort?: NoteSortKey;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  tags?: string[];
  isArchived?: boolean;
  parentNoteId?: string | null;
}
