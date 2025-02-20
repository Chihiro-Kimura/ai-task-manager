import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import TaskColumn from '@/components/TaskColumn';
import { useTaskStore } from '@/store/taskStore';

// モックの作成
jest.mock('@/store/taskStore');
jest.mock('@hello-pangea/dnd', () => ({
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

const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;

describe('TaskColumn', () => {
  const mockProps = {
    category: 'box' as const,
    title: 'BOX',
    getSortModeName: (
      mode: 'custom' | 'priority' | 'createdAt' | 'dueDate'
    ): string => {
      const modeNames = {
        custom: 'カスタム',
        priority: '優先度',
        createdAt: '作成日',
        dueDate: '期限日',
      };
      return modeNames[mode];
    },
    onSortChange: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    mockUseTaskStore.mockReturnValue({
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as ReturnType<typeof useTaskStore>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('正しくレンダリングされること', () => {
    render(<TaskColumn {...mockProps} />);

    expect(screen.getByText('BOX')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('ソートモードを変更できること', () => {
    render(<TaskColumn {...mockProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    // セレクトメニューの選択肢をクリック
    const priorityOption = screen.getByText('優先度');
    fireEvent.click(priorityOption);

    expect(mockProps.onSortChange).toHaveBeenCalledWith('priority');
  });

  it('リセットボタンが正しく動作すること', () => {
    mockUseTaskStore.mockReturnValue({
      sortBy: {
        box: 'priority',
        now: 'custom',
        next: 'custom',
      },
    } as ReturnType<typeof useTaskStore>);

    render(<TaskColumn {...mockProps} />);

    const resetButton = screen.getByRole('button');
    expect(resetButton).not.toBeDisabled();

    fireEvent.click(resetButton);
    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it('カスタムソートの場合、リセットボタンが無効化されること', () => {
    mockUseTaskStore.mockReturnValue({
      sortBy: {
        box: 'custom',
        now: 'custom',
        next: 'custom',
      },
    } as ReturnType<typeof useTaskStore>);

    render(<TaskColumn {...mockProps} />);

    const resetButton = screen.getByRole('button');
    expect(resetButton).toBeDisabled();
  });

  it('すべてのソートオプションが表示されること', () => {
    render(<TaskColumn {...mockProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    expect(screen.getByText('カスタム')).toBeInTheDocument();
    expect(screen.getByText('優先度')).toBeInTheDocument();
    expect(screen.getByText('作成日')).toBeInTheDocument();
    expect(screen.getByText('期限日')).toBeInTheDocument();
  });

  it('現在のソートモードが正しく表示されること', () => {
    mockUseTaskStore.mockReturnValue({
      sortBy: {
        box: 'priority',
        now: 'custom',
        next: 'custom',
      },
    } as ReturnType<typeof useTaskStore>);

    render(<TaskColumn {...mockProps} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('優先度');
  });

  it('異なるカテゴリーで正しく動作すること', () => {
    const nowProps = {
      ...mockProps,
      category: 'now' as const,
      title: 'NOW',
    };

    mockUseTaskStore.mockReturnValue({
      sortBy: {
        box: 'custom',
        now: 'dueDate',
        next: 'custom',
      },
    } as ReturnType<typeof useTaskStore>);

    render(<TaskColumn {...nowProps} />);

    expect(screen.getByText('NOW')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('期限日');
  });
});
