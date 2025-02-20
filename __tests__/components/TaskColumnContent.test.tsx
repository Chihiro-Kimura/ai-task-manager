import { DroppableProvided } from '@hello-pangea/dnd';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import TaskColumnContent from '@/components/TaskColumnContent';
import { useTaskStore } from '@/store/taskStore';
import { TaskWithExtras } from '@/types/task';

// モックの作成
jest.mock('@/store/taskStore');
jest.mock('@/components/DraggableTaskItem', () => ({
  __esModule: true,
  default: ({ task }: { task: TaskWithExtras }): React.ReactElement => (
    <div data-testid="mock-task">{task.title}</div>
  ),
}));

const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;

const mockTasks: TaskWithExtras[] = [
  {
    id: '1',
    title: 'テストタスク1',
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
    title: 'テストタスク2',
    description: '説明2',
    status: '未完了',
    priority: '中',
    category: 'box',
    task_order: 1,
    due_date: new Date('2024-03-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    userId: 'user1',
  },
  {
    id: '3',
    title: 'テストタスク3',
    description: '説明3',
    status: '未完了',
    priority: '低',
    category: 'now',
    task_order: 0,
    due_date: new Date('2024-02-01'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    userId: 'user1',
  },
];

const mockProvided: DroppableProvided = {
  innerRef: jest.fn(),
  droppableProps: {
    'data-rfd-droppable-context-id': 'mock-context',
    'data-rfd-droppable-id': 'mock-id',
  },
  placeholder: null,
};

describe('TaskColumnContent', () => {
  beforeEach(() => {
    mockUseTaskStore.mockReturnValue({
      getFilteredAndSortedTasks: jest
        .fn()
        .mockReturnValue(mockTasks.filter((task) => task.category === 'box')),
    } as ReturnType<typeof useTaskStore>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正しくタスクをレンダリングすること', () => {
    const { getAllByTestId } = render(
      <TaskColumnContent
        category="box"
        provided={mockProvided}
        className="test-class"
      />
    );

    const tasks = getAllByTestId('mock-task');
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toHaveTextContent('テストタスク1');
    expect(tasks[1]).toHaveTextContent('テストタスク2');
  });

  it('空のタスクリストを正しく処理すること', () => {
    mockUseTaskStore.mockReturnValue({
      getFilteredAndSortedTasks: jest.fn().mockReturnValue([]),
    } as ReturnType<typeof useTaskStore>);

    const { container } = render(
      <TaskColumnContent
        category="box"
        provided={mockProvided}
        className="test-class"
      />
    );

    expect(container.querySelector('.space-y-4')?.children.length).toBe(0);
  });

  it('カスタムクラス名が適用されること', () => {
    const { container } = render(
      <TaskColumnContent
        category="box"
        provided={mockProvided}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('space-y-4');
  });

  it('NOWカテゴリーのタスクのみを表示すること', () => {
    mockUseTaskStore.mockReturnValue({
      getFilteredAndSortedTasks: jest
        .fn()
        .mockReturnValue(mockTasks.filter((task) => task.category === 'now')),
    } as ReturnType<typeof useTaskStore>);

    const { getAllByTestId } = render(
      <TaskColumnContent
        category="now"
        provided={mockProvided}
        className="test-class"
      />
    );

    const tasks = getAllByTestId('mock-task');
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toHaveTextContent('テストタスク3');
  });

  it('getFilteredAndSortedTasksが正しいカテゴリーで呼び出されること', () => {
    const mockGetFilteredAndSortedTasks = jest.fn().mockReturnValue([]);
    mockUseTaskStore.mockReturnValue({
      getFilteredAndSortedTasks: mockGetFilteredAndSortedTasks,
    } as ReturnType<typeof useTaskStore>);

    render(
      <TaskColumnContent
        category="next"
        provided={mockProvided}
        className="test-class"
      />
    );

    expect(mockGetFilteredAndSortedTasks).toHaveBeenCalledWith('next');
  });

  it('Droppableのプレースホルダーが正しく表示されること', () => {
    const mockPlaceholder = (
      <div data-testid="mock-placeholder">Placeholder</div>
    );
    const providedWithPlaceholder = {
      ...mockProvided,
      placeholder: mockPlaceholder,
    };

    const { getByTestId } = render(
      <TaskColumnContent
        category="box"
        provided={providedWithPlaceholder}
        className="test-class"
      />
    );

    expect(getByTestId('mock-placeholder')).toBeInTheDocument();
  });
});
