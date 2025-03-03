import { Priority, Tag } from './common';

export interface Note {
  id: string;
  title: string;
  content: string;
  priority?: Priority;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  priority?: Priority;
  tags: string[]; // タグのID配列
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  priority?: Priority;
  tags?: string[]; // タグのID配列
}

export interface NoteWithTags extends Note {
  tags: Tag[];
}
