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

type MockSWRResponse = {
  data: TaskWithExtras[] | undefined;
  error: unknown;
  isLoading: boolean;
  isValidating: boolean;
  mutate: KeyedMutator<TaskWithExtras[]>;
};

describe('TaskList Edge Cases', () => {
  const mockHandleDragEnd = jest.fn();
  const mockGetSortModeName = jest.fn((mode) => mode);
  const mockHandleSortChange = jest.fn();
  const mockHandleReset = jest.fn();
  const mockSetTasks = jest.fn();

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'user1', name: '', email: '', image: '' },
        expires: new Date().toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    mockUseTaskDragDrop.mockReturnValue({
      handleDragEnd: mockHandleDragEnd,
    });

    mockUseTaskSort.mockReturnValue({
      getSortModeName: mockGetSortModeName,
      handleSortChange: () => mockHandleSortChange,
      handleReset: () => mockHandleReset,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('不正なカテゴリーを持つタスクを適切に処理すること', () => {
    const invalidTask = {
      id: '1',
      title: '不正なタスク',
      description: '説明',
      status: '未完了',
      priority: '高',
      category: 'invalid' as 'box', // 不正なカテゴリー
      task_order: 0,
      due_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
    };

    mockUseTaskStore.mockReturnValue({
      tasks: [invalidTask],
      setTasks: mockSetTasks,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    const mockSWRResponse: MockSWRResponse = {
      data: [invalidTask],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

    render(<TaskList />);
    // 不正なカテゴリーのタスクは表示されないことを確認
    expect(screen.queryByText('不正なタスク')).not.toBeInTheDocument();
  });

  it('nullまたはundefinedの値を含むタスクを適切に処理すること', () => {
    const incompleteTask = {
      id: '1',
      title: '不完全なタスク',
      description: null,
      status: '未完了',
      priority: null,
      category: 'box' as const,
      task_order: 0,
      due_date: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
    };

    mockUseTaskStore.mockReturnValue({
      tasks: [incompleteTask],
      setTasks: mockSetTasks,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    const mockSWRResponse: MockSWRResponse = {
      data: [incompleteTask],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

    render(<TaskList />);
    // タスクが正しく表示されることを確認
    expect(screen.getByText('不完全なタスク')).toBeInTheDocument();
  });

  it('無効な日付を含むタスクを適切に処理すること', () => {
    const invalidDateTask = {
      id: '1',
      title: '不正な日付のタスク',
      description: '説明',
      status: '未完了',
      priority: '高',
      category: 'box' as const,
      task_order: 0,
      due_date: new Date('invalid date'),
      createdAt: new Date('invalid date'),
      updatedAt: new Date('invalid date'),
      userId: 'user1',
    };

    mockUseTaskStore.mockReturnValue({
      tasks: [invalidDateTask],
      setTasks: mockSetTasks,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    const mockSWRResponse: MockSWRResponse = {
      data: [invalidDateTask],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

    render(<TaskList />);
    // 不正な日付を含むタスクでもタイトルは表示されることを確認
    expect(screen.getByText('不正な日付のタスク')).toBeInTheDocument();
  });

  it('ネットワークエラー時に適切なエラーメッセージを表示すること', () => {
    const networkError = new Error('Network error');
    networkError.name = 'NetworkError';

    const mockSWRResponse: MockSWRResponse = {
      data: undefined,
      error: networkError,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

    render(<TaskList />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('セッション期限切れ時に適切に処理すること', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'user1', name: '', email: '', image: '' },
        expires: new Date(Date.now() - 1000).toISOString(), // 期限切れのセッション
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    const mockSWRResponse: MockSWRResponse = {
      data: undefined,
      error: new Error('Session expired'),
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

    render(<TaskList />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('異常に長いテキストを含むタスクを適切に表示すること', () => {
    const longTextTask = {
      id: '1',
      title: 'a'.repeat(1000), // 1000文字のタイトル
      description: 'b'.repeat(5000), // 5000文字の説明
      status: '未完了',
      priority: '高',
      category: 'box' as const,
      task_order: 0,
      due_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
    };

    mockUseTaskStore.mockReturnValue({
      tasks: [longTextTask],
      setTasks: mockSetTasks,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    const mockSWRResponse: MockSWRResponse = {
      data: [longTextTask],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    };
    mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

    render(<TaskList />);
    // 長いテキストでもコンポーネントが正しくレンダリングされることを確認
    expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
  });
});
