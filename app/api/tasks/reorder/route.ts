import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { tasks } = await req.json();

  if (!tasks || !Array.isArray(tasks)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const updates = tasks.map((task, index) => ({
    id: task.id,
    task_order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('tasks')
      .update({ task_order: update.task_order })
      .eq('id', update.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Order updated' });
}
