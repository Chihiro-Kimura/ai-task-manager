import { render, act } from '@testing-library/react';
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

describe('TaskList Performance', () => {
  const mockSetTasks = jest.fn();
  const mockHandleDragEnd = jest.fn();

  // モックタスク作成用のヘルパー関数
  const createMockTask = (
    id: string,
    category: 'box' | 'now' | 'next'
  ): TaskWithExtras => ({
    id,
    title: `タスク${id}`,
    description: `説明${id}`,
    status: '未完了',
    priority: '中',
    category,
    task_order: 0,
    due_date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  });

  // 基本的なモックタスクの定義
  const mockTasks: TaskWithExtras[] = [
    {
      id: '1',
      title: 'タスク1',
      description: '説明1',
      status: '未完了',
      priority: '高',
      category: 'box',
      task_order: 0,
      due_date: new Date(),
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
      category: 'now',
      task_order: 0,
      due_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user1',
    },
  ];

  // useTaskDragDropの拡張型定義
  type ExtendedTaskDragDrop = ReturnType<typeof useTaskDragDrop> & {
    isDragging?: boolean;
    draggedTaskId?: string | null;
    dragPosition?: { x: number; y: number };
  };

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
      setTasks: mockSetTasks,
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as unknown as ReturnType<typeof useTaskStore>);

    mockUseTaskDragDrop.mockReturnValue({
      handleDragEnd: mockHandleDragEnd,
    } as ExtendedTaskDragDrop);

    mockUseTaskSort.mockReturnValue({
      getSortModeName: jest.fn((mode) => mode),
      handleSortChange: () => jest.fn(),
      handleReset: () => jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング最適化', () => {
    it('大量のタスクを効率的にレンダリングできること', () => {
      // 各カテゴリーに100個ずつタスクを作成
      const mockTasks: TaskWithExtras[] = [];
      ['box', 'now', 'next'].forEach((category) => {
        Array.from({ length: 100 }).forEach((_, index) => {
          mockTasks.push(
            createMockTask(
              `${category}-${index}`,
              category as 'box' | 'now' | 'next'
            )
          );
        });
      });

      mockUseTaskStore.mockReturnValue({
        tasks: mockTasks,
        setTasks: mockSetTasks,
        sortBy: {
          box: 'custom',
          now: 'custom',
          next: 'custom',
        },
      } as unknown as ReturnType<typeof useTaskStore>);

      const mockSWRResponse: MockSWRResponse = {
        data: mockTasks,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

      const startTime = performance.now();
      render(<TaskList />);
      const endTime = performance.now();

      // レンダリング時間が1000ms未満であることを確認
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('メモ化されたコンポーネントが適切に再レンダリングされること', () => {
      let renderCount = 0;
      const TestComponent = React.memo(function TestComponent() {
        renderCount++;
        return <TaskList />;
      });

      const { rerender } = render(<TestComponent />);

      // プロパティが変更されていない場合は再レンダリングされないことを確認
      rerender(<TestComponent />);
      expect(renderCount).toBe(1);

      // タスクが更新された場合のみ再レンダリングされることを確認
      act(() => {
        const updatedTasks = [...mockTasks];
        updatedTasks[0] = { ...updatedTasks[0], title: '更新されたタスク' };
        mockUseTaskStore.mockReturnValue({
          tasks: updatedTasks,
          setTasks: mockSetTasks,
          sortBy: {
            box: 'custom',
            now: 'custom',
            next: 'custom',
          },
        } as unknown as ReturnType<typeof useTaskStore>);
      });

      rerender(<TestComponent />);
      expect(renderCount).toBe(2);
    });
  });

  describe('状態更新の最適化', () => {
    it('ソート順変更時に必要なカラムのみが更新されること', () => {
      const columnRenderCounts = {
        box: 0,
        now: 0,
        next: 0,
      };

      // カラムコンポーネントのモック
      const MockColumn = React.memo(function MockColumn({
        category,
      }: {
        category: keyof typeof columnRenderCounts;
      }) {
        columnRenderCounts[category]++;
        return null;
      });

      jest.mock('@/components/TaskColumn', () => MockColumn);

      const { rerender } = render(<TaskList />);

      // BOXカラムのソート順のみを変更
      act(() => {
        mockUseTaskStore.mockReturnValue({
          tasks: mockTasks,
          setTasks: mockSetTasks,
          sortBy: {
            box: 'priority',
            now: 'custom',
            next: 'custom',
          },
        } as unknown as ReturnType<typeof useTaskStore>);
      });

      rerender(<TaskList />);

      // BOXカラムのみが再レンダリングされていることを確認
      expect(columnRenderCounts.box).toBe(2);
      expect(columnRenderCounts.now).toBe(1);
      expect(columnRenderCounts.next).toBe(1);
    });

    it('ドラッグ&ドロップ中の不要な再レンダリングが発生しないこと', () => {
      let renderCount = 0;
      const TestComponent = React.memo(function TestComponent() {
        renderCount++;
        return <TaskList />;
      });

      const { rerender } = render(<TestComponent />);
      const initialRenderCount = renderCount;

      // ドラッグ開始
      act(() => {
        mockUseTaskDragDrop.mockReturnValue({
          handleDragEnd: mockHandleDragEnd,
          isDragging: true,
          draggedTaskId: '1',
        } as ExtendedTaskDragDrop);
      });

      rerender(<TestComponent />);

      // ドラッグ中の位置更新
      act(() => {
        mockUseTaskDragDrop.mockReturnValue({
          handleDragEnd: mockHandleDragEnd,
          isDragging: true,
          draggedTaskId: '1',
          dragPosition: { x: 100, y: 100 },
        } as ExtendedTaskDragDrop);
      });

      rerender(<TestComponent />);

      // ドラッグ終了
      act(() => {
        mockUseTaskDragDrop.mockReturnValue({
          handleDragEnd: mockHandleDragEnd,
          isDragging: false,
          draggedTaskId: null,
        } as ExtendedTaskDragDrop);
      });

      rerender(<TestComponent />);

      // ドラッグ&ドロップ操作全体で再レンダリング回数が最小限であることを確認
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });
  });

  describe('メモリ使用の最適化', () => {
    it('大量のタスクを扱う際にメモリリークが発生しないこと', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const largeMockTasks: TaskWithExtras[] = [];

      // 1000個のタスクを生成
      Array.from({ length: 1000 }).forEach((_, index) => {
        largeMockTasks.push(
          createMockTask(
            `task-${index}`,
            ['box', 'now', 'next'][index % 3] as 'box' | 'now' | 'next'
          )
        );
      });

      mockUseTaskStore.mockReturnValue({
        tasks: largeMockTasks,
        setTasks: mockSetTasks,
        sortBy: {
          box: 'custom',
          now: 'custom',
          next: 'custom',
        },
      } as unknown as ReturnType<typeof useTaskStore>);

      const { unmount } = render(<TaskList />);
      unmount();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDiff = finalMemory - initialMemory;

      // メモリ使用量の増加が10MB未満であることを確認
      expect(memoryDiff).toBeLessThan(10 * 1024 * 1024);
    });

    it('コンポーネントのアンマウント時にメモリが適切に解放されること', () => {
      const { unmount } = render(<TaskList />);

      const initialMemory = process.memoryUsage().heapUsed;
      unmount();

      // GCを強制的に実行
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      expect(finalMemory).toBeLessThanOrEqual(initialMemory);
    });
  });
});
