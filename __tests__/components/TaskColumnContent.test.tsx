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
    due_date: null,
    createdAt: new Date(),
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
    due_date: null,
    createdAt: new Date(),
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
      getFilteredAndSortedTasks: jest.fn().mockReturnValue(mockTasks),
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
});
