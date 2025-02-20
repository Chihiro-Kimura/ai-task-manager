import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useSession } from 'next-auth/react';
import React from 'react';
import { KeyedMutator, SWRResponse } from 'swr';
import useSWR from 'swr';

import TaskList from '@/components/TaskList';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { useTaskSort } from '@/hooks/useTaskSort';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

expect.extend(toHaveNoViolations);

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

describe('TaskList Accessibility', () => {
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
      handleDragEnd: jest.fn(),
    });

    mockUseTaskSort.mockReturnValue({
      getSortModeName: jest.fn((mode) => mode),
      handleSortChange: () => jest.fn(),
      handleReset: () => jest.fn(),
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

  it('アクセシビリティ基準を満たしていること', async () => {
    const { container } = render(<TaskList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('WAI-ARIA属性が適切に設定されていること', () => {
    render(<TaskList />);

    // メインのタスクリスト領域
    const taskList = screen.getByTestId('drag-drop-context');
    expect(taskList).toHaveAttribute('role', 'application');
    expect(taskList).toHaveAttribute('aria-label', 'タスクリスト');

    // カテゴリーカラム
    const columns = ['BOX', 'NOW', 'NEXT'].map((category) =>
      screen.getByRole('region', { name: new RegExp(category, 'i') })
    );

    columns.forEach((column) => {
      expect(column).toHaveAttribute('aria-label');
      expect(column).toHaveAttribute('role', 'region');
    });

    // ソート選択
    const sortSelects = screen.getAllByRole('combobox');
    sortSelects.forEach((select) => {
      expect(select).toHaveAttribute('aria-label');
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('キーボード操作', () => {
    it('タブキーで全ての操作要素にフォーカスできること', () => {
      render(<TaskList />);

      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach((element) => {
        element.focus();
        expect(element).toHaveFocus();
      });
    });

    it('ソート選択がキーボードで操作可能であること', () => {
      render(<TaskList />);
      const sortSelect = screen.getAllByRole('combobox')[0];

      // フォーカス
      sortSelect.focus();
      expect(sortSelect).toHaveFocus();

      // Enter/Spaceでオープン
      fireEvent.keyDown(sortSelect, { key: 'Enter' });
      expect(sortSelect).toHaveAttribute('aria-expanded', 'true');

      // 矢印キーで選択
      fireEvent.keyDown(sortSelect, { key: 'ArrowDown' });
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveFocus();

      // Enterで選択
      fireEvent.keyDown(options[0], { key: 'Enter' });
      expect(sortSelect).toHaveAttribute('aria-expanded', 'false');
    });

    it('ドラッグ&ドロップがキーボードで操作可能であること', () => {
      render(<TaskList />);
      const tasks = screen.getAllByRole('button');
      const firstTask = tasks[0];

      // スペースでドラッグ開始
      firstTask.focus();
      fireEvent.keyDown(firstTask, { key: ' ' });
      expect(firstTask).toHaveAttribute('aria-grabbed', 'true');

      // 矢印キーで移動
      fireEvent.keyDown(firstTask, { key: 'ArrowDown' });
      fireEvent.keyDown(firstTask, { key: 'ArrowRight' });

      // スペースでドロップ
      fireEvent.keyDown(firstTask, { key: ' ' });
      expect(firstTask).toHaveAttribute('aria-grabbed', 'false');
    });
  });

  describe('スクリーンリーダー対応', () => {
    it('タスクの状態が適切にアナウンスされること', () => {
      render(<TaskList />);
      const tasks = screen.getAllByRole('button');

      tasks.forEach((task) => {
        expect(task).toHaveAttribute('aria-label');
        expect(task).toHaveAttribute('aria-description');
      });
    });

    it('エラー状態が適切にアナウンスされること', () => {
      const mockSWRResponse: MockSWRResponse = {
        data: undefined,
        error: new Error('Network error'),
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

      render(<TaskList />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
      expect(errorMessage).toHaveTextContent(/エラーが発生しました/i);
    });

    it('ローディング状態が適切にアナウンスされること', () => {
      const mockSWRResponse: MockSWRResponse = {
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      };
      mockUseSWR.mockReturnValue(mockSWRResponse as SWRResponse);

      render(<TaskList />);
      const loadingMessage = screen.getByRole('status');
      expect(loadingMessage).toHaveAttribute('aria-live', 'polite');
      expect(loadingMessage).toHaveTextContent(/読み込み中/i);
    });

    it('ドラッグ&ドロップ操作の状態が適切にアナウンスされること', () => {
      render(<TaskList />);
      const tasks = screen.getAllByRole('button');
      const firstTask = tasks[0];

      firstTask.focus();
      fireEvent.keyDown(firstTask, { key: ' ' });
      expect(firstTask).toHaveAttribute(
        'aria-roledescription',
        'ドラッグ可能なアイテム'
      );
      expect(firstTask).toHaveAttribute('aria-grabbed', 'true');
    });
  });
});
