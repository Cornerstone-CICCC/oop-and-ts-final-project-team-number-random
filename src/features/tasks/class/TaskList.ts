import type { Task, TaskStatus } from "@/types";
import { getDraggedTaskId, setDraggedTaskId } from "../utils";

export class TaskList {
  tasks: Task[];

  constructor(initialTasks: Task[] = []) {
    this.tasks = [...initialTasks];
  }

  getAll(): Task[] {
    return [...this.tasks];
  }

  getByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter((task) => task.status === status);
  }

  add(newTask: Task): void {
    this.tasks.push(newTask);
  }

  updateTaskStatus(taskId: string, targetStatus: TaskStatus): boolean {
    const targetTask = this.tasks.find((task) => task.id === taskId);
    if (!targetTask) {
      return false;
    }

    if (targetTask.status === targetStatus) {
      return false;
    }

    targetTask.status = targetStatus;
    return true;
  }

  onDrag(taskId: string, dataTransfer: DataTransfer | null): void {
    setDraggedTaskId(dataTransfer, taskId);
  }

  onDrop(dataTransfer: DataTransfer | null, targetStatus: TaskStatus): boolean {
    const taskId = getDraggedTaskId(dataTransfer);
    if (!taskId) {
      return false;
    }

    return this.updateTaskStatus(taskId, targetStatus);
  }
}
