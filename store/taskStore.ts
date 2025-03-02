import { create } from 'zustand';

import { TaskWithExtras } from '@/types/task';

interface TaskState {
  tasks: TaskWithExtras[];
  setTasks: (tasks: TaskWithExtras[]) => void;
  updateTaskOrder: (updatedTasks: TaskWithExtras[]) => void;
  sortBy: {
    box: 'custom' | 'priority' | 'createdAt' | 'dueDate';
    now: 'custom' | 'priority' | 'createdAt' | 'dueDate';
    next: 'custom' | 'priority' | 'createdAt' | 'dueDate';
  };
  setSortBy: (
    category: 'box' | 'now' | 'next',
    value: 'custom' | 'priority' | 'createdAt' | 'dueDate'
  ) => void;
  getFilteredAndSortedTasks: (
    category: 'box' | 'now' | 'next'
  ) => TaskWithExtras[];
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTaskOrder: (updatedTasks) => set({ tasks: updatedTasks }),
  sortBy: {
    box: 'custom',
    now: 'custom',
    next: 'custom',
  },
  setSortBy: (category, value) =>
    set((state) => ({
      sortBy: {
        ...state.sortBy,
        [category]: value,
      },
    })),
  getFilteredAndSortedTasks: (category) => {
    const state = get();
    const filteredTasks = state.tasks.filter(
      (task) => task.category === category
    );

    if (state.sortBy[category] === 'custom') {
      return [...filteredTasks].sort((a, b) => a.task_order - b.task_order);
    }

    const sortedTasks = [...filteredTasks];

    switch (state.sortBy[category]) {
      case 'priority':
        return sortedTasks.sort((a, b) => {
          const priorityOrder = { 高: 0, 中: 1, 低: 2 };
          const aOrder =
            priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
          const bOrder =
            priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return a.task_order - b.task_order;
        });
      case 'dueDate':
        return sortedTasks.sort((a, b) => {
          if (!a.due_date && !b.due_date) return a.task_order - b.task_order;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          const dateCompare =
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          if (dateCompare !== 0) return dateCompare;
          return a.task_order - b.task_order;
        });
      case 'createdAt':
        return sortedTasks.sort((a, b) => {
          const dateCompare =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          if (dateCompare !== 0) return dateCompare;
          return a.task_order - b.task_order;
        });
      default:
        return sortedTasks;
    }
  },
  isEditModalOpen: false,
  setIsEditModalOpen: (isOpen) => set({ isEditModalOpen: isOpen }),
}));
