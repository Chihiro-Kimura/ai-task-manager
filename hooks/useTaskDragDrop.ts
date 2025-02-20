import { DropResult } from "@hello-pangea/dnd";
import { useSession } from "next-auth/react";

import { useToast } from "@/hooks/use-toast";
import { useTaskStore } from "@/store/taskStore";

export function useTaskDragDrop(): {
  handleDragEnd: (result: DropResult) => Promise<void>;
} {
  const { data: session } = useSession();
  const { toast } = useToast();
  const {
    tasks,
    updateTaskOrder,
    sortBy,
    setSortBy,
    getFilteredAndSortedTasks,
    isEditModalOpen,
  } = useTaskStore();

  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination || isEditModalOpen) return;

    const sourceCategory = result.source.droppableId;
    const destinationCategory = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (
      sourceCategory === destinationCategory &&
      sourceIndex === destinationIndex
    ) {
      return;
    }

    // カスタム順でない場合は、カスタム順に切り替える
    if (
      sortBy[sourceCategory as keyof typeof sortBy] !== "custom" ||
      sortBy[destinationCategory as keyof typeof sortBy] !== "custom"
    ) {
      const sourceCategoryTasks = getFilteredAndSortedTasks(
        sourceCategory as "box" | "now" | "next",
      );
      const destinationCategoryTasks =
        sourceCategory === destinationCategory
          ? sourceCategoryTasks
          : getFilteredAndSortedTasks(
              destinationCategory as "box" | "now" | "next",
            );

      const updatedTasks = [...tasks];

      sourceCategoryTasks.forEach((task, index) => {
        const taskToUpdate = updatedTasks.find((t) => t.id === task.id);
        if (taskToUpdate) {
          taskToUpdate.task_order = index;
        }
      });

      if (sourceCategory !== destinationCategory) {
        destinationCategoryTasks.forEach((task, index) => {
          const taskToUpdate = updatedTasks.find((t) => t.id === task.id);
          if (taskToUpdate) {
            taskToUpdate.task_order = index;
          }
        });
      }

      updateTaskOrder(updatedTasks);
      setSortBy(sourceCategory as "box" | "now" | "next", "custom");
      if (sourceCategory !== destinationCategory) {
        setSortBy(destinationCategory as "box" | "now" | "next", "custom");
      }
    }

    const previousTasks = [...tasks];

    try {
      const updatedTasks = [...tasks];
      const movedTask = updatedTasks.find(
        (task) =>
          task.category === sourceCategory && task.id === result.draggableId,
      );

      if (!movedTask) {
        throw new Error("Task not found");
      }

      if (sourceCategory === destinationCategory) {
        const categoryTasks = updatedTasks.filter(
          (task) =>
            task.category === sourceCategory && task.id !== movedTask.id,
        );

        movedTask.task_order = destinationIndex;

        categoryTasks.forEach((task) => {
          if (sourceIndex < destinationIndex) {
            if (
              task.task_order > sourceIndex &&
              task.task_order <= destinationIndex
            ) {
              task.task_order -= 1;
            }
          } else {
            if (
              task.task_order >= destinationIndex &&
              task.task_order < sourceIndex
            ) {
              task.task_order += 1;
            }
          }
        });
      } else {
        updatedTasks
          .filter(
            (task) =>
              task.category === sourceCategory && task.task_order > sourceIndex,
          )
          .forEach((task) => {
            task.task_order -= 1;
          });

        updatedTasks
          .filter(
            (task) =>
              task.category === destinationCategory &&
              task.task_order >= destinationIndex,
          )
          .forEach((task) => {
            task.task_order += 1;
          });

        movedTask.category = destinationCategory;
        movedTask.task_order = destinationIndex;
      }

      updateTaskOrder(updatedTasks);

      const response = await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": session?.user?.id || "",
        },
        body: JSON.stringify({
          tasks: updatedTasks.map((task) => ({
            id: task.id,
            category: task.category,
            task_order: task.task_order,
          })),
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Failed to update task order");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      updateTaskOrder(previousTasks);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "タスクの更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  return { handleDragEnd };
}
