import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { type ReactElement } from 'react';

import { NoteDetail } from '@/components/(notes)/detail/NoteDetail';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';

interface NotePageProps {
  params: {
    noteId: string;
  };
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      title: 'メモ - AI Task Manager',
    };
  }

  const note = await prisma.note.findFirst({
    where: {
      id: params.noteId,
      userId: session.user.id,
    },
  });

  if (!note) {
    return {
      title: 'メモが見つかりません - AI Task Manager',
    };
  }

  return {
    title: `${note.title} - AI Task Manager`,
    description: note.content,
  };
}

export default async function NotePage({
  params,
}: NotePageProps): Promise<ReactElement> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const note = await prisma.note.findFirst({
    where: {
      id: params.noteId,
      userId: session.user.id,
    },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <NoteDetail note={note} />
    </div>
  );
} 