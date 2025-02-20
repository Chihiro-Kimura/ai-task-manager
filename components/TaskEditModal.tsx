import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { useToast } from "@/hooks/use-toast";

import { useTaskStore } from "@/store/taskStore";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface IFormData {
  title: string;
  description: string;
  status: "未完了" | "完了";
  priority: "高" | "中" | "低";
  category: "box" | "now" | "next";
  due_date: string;
}

const defaultValues: IFormData = {
  title: "",
  description: "",
  status: "未完了",
  priority: "中",
  category: "box",
  due_date: "",
};

export default function TaskEditModal(): React.JSX.Element {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { isEditModalOpen, setIsEditModalOpen, editingTask, tasks, setTasks } =
    useTaskStore();

  console.log("TaskEditModal rendered:", { isEditModalOpen, editingTask });

  const form = useForm<IFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (!isEditModalOpen) {
      form.reset(defaultValues);
      return;
    }

    if (editingTask) {
      form.reset({
        title: editingTask.title,
        description: editingTask.description || "",
        status: editingTask.status as "未完了" | "完了",
        priority: (editingTask.priority || "中") as "高" | "中" | "低",
        category: editingTask.category as "box" | "now" | "next",
        due_date: editingTask.due_date
          ? format(new Date(editingTask.due_date), "yyyy-MM-dd")
          : "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editingTask, form, isEditModalOpen]);

  const onSubmit = async (data: IFormData): Promise<void> => {
    if (!session?.user?.id) return;

    try {
      const method = editingTask ? "PATCH" : "POST";
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": session.user.id,
        },
        body: JSON.stringify({
          ...data,
          due_date: data.due_date ? new Date(data.due_date) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      const savedTask = await response.json();

      if (editingTask) {
        setTasks(
          tasks.map((task) =>
            task.id === editingTask.id ? { ...task, ...savedTask } : task,
          ),
        );
      } else {
        setTasks([...tasks, savedTask]);
      }

      toast({
        title: "保存完了",
        description: `タスクを${editingTask ? "更新" : "作成"}しました`,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to save task:", error);
      toast({
        title: "エラー",
        description: "タスクの保存に失敗しました",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={isEditModalOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange:", open);
        setIsEditModalOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "タスクの編集" : "新規タスクの作成"}
          </DialogTitle>
          <DialogDescription>
            タスクの詳細情報を入力してください。すべての項目が保存されます。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>優先度</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="高">高</SelectItem>
                        <SelectItem value="中">中</SelectItem>
                        <SelectItem value="低">低</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリー</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="box">BOX</SelectItem>
                        <SelectItem value="now">NOW</SelectItem>
                        <SelectItem value="next">NEXT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>期限</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
