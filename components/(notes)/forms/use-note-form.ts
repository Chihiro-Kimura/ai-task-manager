import { zodResolver } from '@hookform/resolvers/zod';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';

import { type NoteFormValues, noteFormSchema } from './note-form-schema';

interface UseNoteFormProps {
  defaultValues?: Partial<NoteFormValues>;
  onSubmit: (values: NoteFormValues) => Promise<void>;
}

interface UseNoteFormReturn {
  form: UseFormReturn<NoteFormValues>;
  isRichText: boolean;
  setIsRichText: Dispatch<SetStateAction<boolean>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function useNoteForm({ defaultValues, onSubmit }: UseNoteFormProps): UseNoteFormReturn {
  // HTMLタグを含む場合はリッチテキストモードで開く
  const [isRichText, setIsRichText] = useState(() => {
    return defaultValues?.content?.includes('</') ?? true;
  });

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: '中',
      tags: [],
      category: 'general',
      ...defaultValues,
    },
  });

  const handleSubmit = async (values: NoteFormValues): Promise<void> => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return {
    form,
    isRichText,
    setIsRichText,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
} 