// src/components/EditTaskForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mutate } from 'swr';
import { useSession } from 'next-auth/react';

interface EditTaskFormProps {
  taskId: string;
  currentTitle: string;
  currentDescription?: string;
  onClose: () => void;
}

export default function EditTaskForm({
  taskId,
  currentTitle,
  currentDescription = '',
  onClose,
}: EditTaskFormProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState(currentTitle ?? '');
  const [description, setDescription] = useState(currentDescription ?? '');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!session?.user?.id) {
      toast({
        title: '❌ エラー',
        description: '認証情報が見つかりません',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': session.user.id,
        },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: '✅ 更新成功',
          description: 'タスクが更新されました！',
        });
        mutate('/api/tasks'); // 一覧を即時更新
        onClose();
      } else {
        toast({
          title: '❌ エラー',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ エラー',
        description: '通信エラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">✏️ タスクを編集</h2>
        <Input
          value={title ?? ''}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="mb-3"
        />
        <Textarea
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="詳細"
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} className="bg-gray-400">
            キャンセル
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isLoading}
            className="bg-blue-500 text-white"
          >
            {isLoading ? '更新中...' : '更新'}
          </Button>
        </div>
      </div>
    </div>
  );
}
