import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import React from 'react';

import TaskItem from '@/components/TaskItem';
import { useToast } from '@/hooks/use-toast';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

// モックの作成
jest.mock('next-auth/react');
jest.mock('@/store/taskStore');
jest.mock('@/hooks/use-toast');
jest.mock('lucide-react', () => ({
  Check: (): React.ReactElement => <span>Check</span>,
  Clock: (): React.ReactElement => <span>Clock</span>,
  Pencil: (): React.ReactElement => <span>Pencil</span>,
  Trash2: (): React.ReactElement => <span>Trash2</span>,
}));
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
  AlertDialogTrigger: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
  AlertDialogContent: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
  AlertDialogTitle: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
  AlertDialogDescription: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
  AlertDialogFooter: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }): React.ReactElement => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <button>{children}</button>,
}));
jest.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }): React.ReactElement => <span className={className}>{children}</span>,
}));
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }): React.ReactElement => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockTask: TaskWithExtras = {
  id: '1',
  title: 'テストタスク',
  description: '説明文',
  status: '未完了',
  priority: '高',
  category: 'box',
  task_order: 0,
  due_date: new Date('2024-03-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user1',
};

describe('TaskItem', () => {
  const mockToast = jest.fn();
  const mockSetEditingTask = jest.fn();
  const mockSetIsEditModalOpen = jest.fn();

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'user1', name: '', email: '', image: '' },
        expires: new Date().toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    });

    mockUseTaskStore.mockReturnValue({
      setEditingTask: mockSetEditingTask,
      setIsEditModalOpen: mockSetIsEditModalOpen,
    });

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('タスクの情報を正しく表示すること', () => {
    render(<TaskItem task={mockTask} />);

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(screen.getByText('説明文')).toBeInTheDocument();
    expect(screen.getByText('高')).toBeInTheDocument();
    expect(screen.getByText('3/1')).toBeInTheDocument();
  });

  it('完了状態のタスクが取り消し線付きで表示されること', () => {
    const completedTask = { ...mockTask, status: '完了' };
    render(<TaskItem task={completedTask} />);

    expect(screen.getByText('テストタスク')).toHaveClass('line-through');
    expect(screen.getByText('説明文')).toHaveClass('line-through');
  });

  it('ステータストグルボタンをクリックしたときにAPIが呼ばれること', async () => {
    render(<TaskItem task={mockTask} />);

    const toggleButton = screen.getByRole('button', { name: 'Check' }); // Checkアイコンのボタン
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/tasks/${mockTask.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'user1',
      },
      body: JSON.stringify({
        status: '完了',
      }),
    });
  });

  it('編集ボタンをクリックしたときに編集モーダルが開くこと', () => {
    render(<TaskItem task={mockTask} />);

    const editButton = screen.getByRole('button', { name: 'Pencil' }); // Pencilアイコンのボタン
    fireEvent.click(editButton);

    expect(mockSetEditingTask).toHaveBeenCalledWith(mockTask);
    expect(mockSetIsEditModalOpen).toHaveBeenCalledWith(true);
  });

  it('削除ボタンをクリックしたときに確認ダイアログが表示されること', () => {
    render(<TaskItem task={mockTask} />);

    const deleteButton = screen.getByRole('button', { name: 'Trash2' }); // Trash2アイコンのボタン
    fireEvent.click(deleteButton);

    const dialogContent = screen.getByTestId('alert-dialog-content');
    expect(dialogContent).toHaveTextContent(
      'このタスクを削除してもよろしいですか？この操作は取り消せません。'
    );
  });

  it('削除を確認したときにAPIが呼ばれること', async () => {
    render(<TaskItem task={mockTask} />);

    const deleteButton = screen.getByRole('button', { name: 'Trash2' }); // Trash2アイコンのボタン
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: '削除' });
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(global.fetch).toHaveBeenCalledWith(`/api/tasks/${mockTask.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'user1',
      },
    });
  });
});
