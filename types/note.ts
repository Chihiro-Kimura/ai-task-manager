export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tags: string[]; // タグのID配列
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[]; // タグのID配列
}

export interface NoteWithTags extends Note {
  tags: Tag[];
}
