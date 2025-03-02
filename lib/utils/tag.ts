import { Tag } from '@prisma/client';

import { TAG_MESSAGES } from '@/lib/constants/messages';
import { getRandomColor } from '@/lib/utils';

export interface TagUpdateParams {
  id?: string;
  type?: 'task' | 'note';
  tags: string[];
}

export class TagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagError';
  }
}

export async function createTag(name: string): Promise<Tag> {
  try {
    const randomColor = getRandomColor();
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        color: JSON.stringify(randomColor),
      }),
    });

    if (!response.ok) {
      throw new TagError(TAG_MESSAGES.CREATE_ERROR);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.CREATE_ERROR);
  }
}

export async function updateTags({ id, type = 'task', tags }: TagUpdateParams): Promise<Tag[]> {
  try {
    if (!id) {
      throw new TagError(TAG_MESSAGES.UPDATE_ERROR);
    }

    const endpoint = type === 'task' 
      ? `/api/tasks/${id}/tags`
      : `/api/notes/${id}/tags`;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    });

    if (!response.ok) {
      throw new TagError(TAG_MESSAGES.UPDATE_ERROR);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.UPDATE_ERROR);
  }
}

export async function deleteTag(tagId: string): Promise<void> {
  try {
    const response = await fetch(`/api/tags/${tagId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new TagError(TAG_MESSAGES.DELETE_ERROR);
    }
  } catch (error) {
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.DELETE_ERROR);
  }
}

export async function fetchTags(): Promise<Tag[]> {
  try {
    const response = await fetch('/api/tags');
    
    if (!response.ok) {
      throw new TagError(TAG_MESSAGES.FETCH_ERROR);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TagError) {
      throw error;
    }
    throw new TagError(TAG_MESSAGES.FETCH_ERROR);
  }
} 