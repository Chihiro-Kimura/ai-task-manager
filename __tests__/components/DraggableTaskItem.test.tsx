import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import DraggableTaskItem from "@/components/DraggableTaskItem";
import { useTaskStore } from "@/store/taskStore";
import { TaskWithExtras } from "@/types/task";

// モックの作成
jest.mock("@/store/taskStore");
jest.mock("@/components/TaskItem", () => ({
  __esModule: true,
  default: ({ task }: { task: TaskWithExtras }): React.ReactElement => (
    <div data-testid="mock-task-item">{task.title}</div>
  ),
}));

jest.mock("@hello-pangea/dnd", () => ({
  Draggable: ({
    children,
  }: {
    children: (
      provided: {
        draggableProps: { style: Record<string, unknown> };
        dragHandleProps: Record<string, unknown>;
        innerRef: () => void;
      },
      snapshot: { isDragging: boolean },
    ) => React.ReactNode;
  }): React.ReactElement => {
    const provided = {
      draggableProps: {
        style: {},
      },
      dragHandleProps: {},
      innerRef: jest.fn(),
    };
    const snapshot = { isDragging: false };
    return children(provided, snapshot) as React.ReactElement;
  },
}));

const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;

const mockTask: TaskWithExtras = {
  id: "1",
  title: "テストタスク",
  description: "説明",
  status: "未完了",
  priority: "高",
  category: "box",
  task_order: 0,
  due_date: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user1",
};

describe("DraggableTaskItem", () => {
  beforeEach(() => {
    mockUseTaskStore.mockReturnValue({
      isEditModalOpen: false,
    } as ReturnType<typeof useTaskStore>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("タスクを正しくレンダリングすること", () => {
    const { getByTestId } = render(
      <DraggableTaskItem task={mockTask} index={0} />,
    );

    expect(getByTestId("mock-task-item")).toHaveTextContent("テストタスク");
  });

  it("編集モーダルが開いているときにドラッグを無効化すること", () => {
    mockUseTaskStore.mockReturnValue({
      isEditModalOpen: true,
    } as ReturnType<typeof useTaskStore>);

    const { container } = render(
      <DraggableTaskItem task={mockTask} index={0} />,
    );

    expect(container.firstChild).toHaveClass("cursor-default");
    expect(container.firstChild).toHaveClass("pointer-events-none");
  });

  it("編集モーダルが閉じているときにドラッグを有効化すること", () => {
    const { container } = render(
      <DraggableTaskItem task={mockTask} index={0} />,
    );

    expect(container.firstChild).toHaveClass("cursor-grab");
    expect(container.firstChild).not.toHaveClass("pointer-events-none");
  });
});
