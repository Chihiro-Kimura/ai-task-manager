import * as z from 'zod';

export const noteFormSchema = z.object({
  title: z.string().min(1, '必須項目です'),
  content: z.string().min(1, '必須項目です'),
  priority: z.enum(['高', '中', '低']).optional(),
  tags: z.array(z.string()),
  category: z.enum(['general', 'diary', 'idea', 'reference', 'task_note']).default('general'),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>; 