import { useTaskStore } from '@/store/taskStore';

type SortMode = 'custom' | 'priority' | 'createdAt' | 'dueDate';
type Category = 'box' | 'now' | 'next';

interface IUseTaskSort {
  getSortModeName: (mode: SortMode) => string;
  handleSortChange: (category: Category) => (value: SortMode) => void;
  handleReset: (category: Category) => () => void;
}

export function useTaskSort(): IUseTaskSort {
  const { setSortBy } = useTaskStore();

  const getSortModeName = (mode: SortMode): string => {
    const modeNames = {
      custom: 'カスタム',
      priority: '優先度',
      createdAt: '作成日',
      dueDate: '期限日',
    };
    return modeNames[mode];
  };

  const handleSortChange =
    (category: Category) =>
    (value: SortMode): void => {
      setSortBy(category, value);
    };

  const handleReset = (category: Category) => (): void => {
    setSortBy(category, 'custom');
  };

  return {
    getSortModeName,
    handleSortChange,
    handleReset,
  };
}
