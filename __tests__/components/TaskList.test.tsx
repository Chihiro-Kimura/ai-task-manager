import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import React from 'react';
import { KeyedMutator, SWRResponse } from 'swr';
import useSWR from 'swr';

import TaskList from '@/components/TaskList';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { useTaskSort } from '@/hooks/useTaskSort';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

// モックの作成
jest.mock('next-auth/react');
jest.mock('@/store/taskStore');
jest.mock('@/hooks/useTaskDragDrop');
jest.mock('@/hooks/useTaskSort');
jest.mock('swr');

// DragDropContextのモック
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => (
    <div data-testid="drag-drop-context">{children}</div>
  ),
  Droppable: ({
    children,
  }: {
    children: (provided: {
      innerRef: () => void;
      droppableProps: Record<string, unknown>;
      placeholder: null;
    }) => React.ReactNode;
  }): React.ReactElement => {
    const provided = {
      innerRef: jest.fn(),
      droppableProps: {
        'data-rfd-droppable-context-id': 'mock-context',
        'data-rfd-droppable-id': 'mock-id',
      },
      placeholder: null,
    };
    return children(provided) as React.ReactElement;
  },
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockUseTaskDragDrop = useTaskDragDrop as jest.MockedFunction<
  typeof useTaskDragDrop
>;
const mockUseTaskSort = useTaskSort as jest.MockedFunction<typeof useTaskSort>;
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

const mockTasks: TaskWithExtras[] = [
  {
    id: '1',
    title: 'BOXタスク1',
    description: '説明1',
    status: '未完了',
    priority: '高',
    category: 'box',
    task_order: 0,
    due_date: new Date('2024-03-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    userId: 'user1',
  },
  {
    id: '2',
    title: 'NOWタスク1',
    description: '説明2',
    status: '未完了',
    priority: '中',
    category: 'now',
    task_order: 0,
    due_date: new Date('2024-03-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    userId: 'user1',
  },
  {
    id: '3',
    title: 'NEXTタスク1',
    description: '説明3',
    status: '未完了',
    priority: '低',
    category: 'next',
    task_order: 0,
    due_date: new Date('2024-02-01'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    userId: 'user1',
  },
];

type MockSWRResponse = {
  data: TaskWithExtras[] | undefined;
  error: unknown;
  isLoading: boolean;
  isValidating: boolean;
  mutate: KeyedMutator<TaskWithExtras[]>;
};

describe('TaskList', () => {
  const mockHandleDragEnd = jest.fn();
  const mockGetSortModeName = jest.fn((mode) => mode);
  const mockHandleSortChange = jest.fn();
  const mockHandleReset = jest.fn();

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'user1', name: '', email: '', image: '' },
        expires: new Date().toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    mockUseTaskStore.mockReturnValue({
      tasks: mockTasks,
      setTasks: jest.fn(),
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    mockUseTaskDragDrop.mockReturnValue({
      handleDragEnd: mockHandleDragEnd,
    });

    mockUseTaskSort.mockReturnValue({
      getSortModeName: mockGetSortModeName,
      handleSortChange: () => mockHandleSortChange,
      handleReset: () => mockHandleReset,
    });

    const mockSWRResponse: MockSWRResponse = {
      data: mockTasks,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('認証済みユーザーに対して正しくタスクを表示すること', () => {
    render(<TaskList />);

    expect(screen.getByText('BOXタスク1')).toBeInTheDocument();
    expect(screen.getByText('NOWタスク1')).toBeInTheDocument();
    expect(screen.getByText('NEXTタスク1')).toBeInTheDocument();
  });

  it('ローディング状態を正しく表示すること', () => {
    const loadingResponse: MockSWRResponse = {
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(loadingResponse as SWRResponse);

    render(<TaskList />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('エラー状態を正しく表示すること', () => {
    const errorResponse: MockSWRResponse = {
      data: undefined,
      error: new Error('Failed to fetch'),
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(errorResponse as SWRResponse);

    render(<TaskList />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('タスクが空の場合、適切なメッセージを表示すること', () => {
    mockUseTaskStore.mockReturnValue({
      tasks: [],
      setTasks: jest.fn(),
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    render(<TaskList />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
    expect(
      screen.getByText('新しいタスクを追加してください')
    ).toBeInTheDocument();
  });

  it('すべてのカテゴリーカラムが表示されること', () => {
    render(<TaskList />);

    expect(screen.getByText('BOX')).toBeInTheDocument();
    expect(screen.getByText('NOW')).toBeInTheDocument();
    expect(screen.getByText('NEXT')).toBeInTheDocument();
  });

  it('DragDropContextが正しく設定されていること', () => {
    render(<TaskList />);

    const dragDropContext = screen.getByTestId('drag-drop-context');
    expect(dragDropContext).toBeInTheDocument();
    expect(mockHandleDragEnd).not.toHaveBeenCalled();
  });

  it('非認証ユーザーの場合、タスクを取得しないこと', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(<TaskList />);
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
  });

  it('タスクデータが更新されたとき、storeが更新されること', () => {
    const setTasks = jest.fn();
    mockUseTaskStore.mockReturnValue({
      tasks: [],
      setTasks,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    render(<TaskList />);
    expect(setTasks).toHaveBeenCalledWith(mockTasks);
  });
});
