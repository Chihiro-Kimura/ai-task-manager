import { DropResult } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';

import { useToast } from '@/hooks/use-toast';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

// モックの作成
jest.mock('next-auth/react');
jest.mock('@/store/taskStore');
jest.mock('@/hooks/use-toast');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockTasks: TaskWithExtras[] = [
  {
    id: '1',
    title: 'タスク1',
    description: '説明1',
    status: '未完了',
    priority: '高',
    category: 'box',
    task_order: 0,
    due_date: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  },
  {
    id: '2',
    title: 'タスク2',
    description: '説明2',
    status: '未完了',
    priority: '中',
    category: 'box',
    task_order: 1,
    due_date: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  },
  {
    id: '3',
    title: 'タスク3',
    description: '説明3',
    status: '未完了',
    priority: '低',
    category: 'now',
    task_order: 0,
    due_date: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  },
];

const createDropResult = (
  source: { droppableId: string; index: number },
  destination: { droppableId: string; index: number } | null,
  draggableId = '1'
): DropResult => ({
  draggableId,
  type: 'DEFAULT',
  source,
  destination,
  reason: 'DROP',
  mode: 'FLUID',
  combine: null,
});

describe('useTaskDragDrop', () => {
  const mockToast = jest.fn();
  const mockUpdateTaskOrder = jest.fn();
  const mockSetSortBy = jest.fn();
  const mockGetFilteredAndSortedTasks = jest.fn();

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
      tasks: mockTasks,
      updateTaskOrder: mockUpdateTaskOrder,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
      setSortBy: mockSetSortBy,
      getFilteredAndSortedTasks: mockGetFilteredAndSortedTasks,
      isEditModalOpen: false,
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

  it('ドロップ先が未定義の場合は何もしないこと', async () => {
    const { result } = renderHook(() => useTaskDragDrop());

    await result.current.handleDragEnd(
      createDropResult(
        {
          droppableId: 'box',
          index: 0,
        },
        null
      )
    );

    expect(mockUpdateTaskOrder).not.toHaveBeenCalled();
    expect(mockSetSortBy).not.toHaveBeenCalled();
  });

  it('編集モーダルが開いている場合は何もしないこと', async () => {
    mockUseTaskStore.mockReturnValue({
      tasks: mockTasks,
      updateTaskOrder: mockUpdateTaskOrder,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
      setSortBy: mockSetSortBy,
      getFilteredAndSortedTasks: mockGetFilteredAndSortedTasks,
      isEditModalOpen: true,
    });

    const { result } = renderHook(() => useTaskDragDrop());

    await result.current.handleDragEnd(
      createDropResult(
        {
          droppableId: 'box',
          index: 0,
        },
        {
          droppableId: 'box',
          index: 1,
        }
      )
    );

    expect(mockUpdateTaskOrder).not.toHaveBeenCalled();
    expect(mockSetSortBy).not.toHaveBeenCalled();
  });

  it('同じカテゴリー内での移動を正しく処理すること', async () => {
    mockGetFilteredAndSortedTasks.mockReturnValue(mockTasks.slice(0, 2));

    const { result } = renderHook(() => useTaskDragDrop());

    await result.current.handleDragEnd(
      createDropResult(
        {
          droppableId: 'box',
          index: 0,
        },
        {
          droppableId: 'box',
          index: 1,
        }
      )
    );

    expect(mockUpdateTaskOrder).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/tasks/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'user1',
      },
      body: expect.any(String),
    });
  });

  it('異なるカテゴリー間の移動を正しく処理すること', async () => {
    mockGetFilteredAndSortedTasks
      .mockReturnValueOnce(mockTasks.slice(0, 2))
      .mockReturnValueOnce([mockTasks[2]]);

    const { result } = renderHook(() => useTaskDragDrop());

    await result.current.handleDragEnd(
      createDropResult(
        {
          droppableId: 'box',
          index: 0,
        },
        {
          droppableId: 'now',
          index: 0,
        }
      )
    );

    expect(mockUpdateTaskOrder).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/tasks/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'user1',
      },
      body: expect.any(String),
    });
  });

  it('APIエラー時にトーストを表示し、元の状態に戻すこと', async () => {
    mockGetFilteredAndSortedTasks
      .mockReturnValueOnce(mockTasks.slice(0, 2))
      .mockReturnValueOnce([mockTasks[2]]);

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Task not found' }),
      })
    );

    const { result } = renderHook(() => useTaskDragDrop());

    await result.current.handleDragEnd(
      createDropResult(
        {
          droppableId: 'box',
          index: 0,
        },
        {
          droppableId: 'now',
          index: 0,
        }
      )
    );

    expect(mockToast).toHaveBeenCalledWith({
      title: 'エラー',
      description: 'Task not found',
      variant: 'destructive',
    });
    expect(mockUpdateTaskOrder).toHaveBeenCalledWith(mockTasks);
  });
});
