import type { DragEvent } from "react";
import { useState } from "react";
import { SearchBar } from "@/components";
import { DUMMY_TASKS, TaskList } from "@/features/tasks";
import type { TaskStatus } from "@/types";
import { KanbanColumn } from "./KanbanColumn";

const COLUMN_TITLES: TaskStatus[] = ["To Do", "In Progress", "Done"];

export function KanbanBoard() {
  const [taskList] = useState(() => new TaskList(DUMMY_TASKS));
  const [, setRefreshKey] = useState(0);

  const refreshBoard = (): void => {
    setRefreshKey((currentValue) => currentValue + 1);
  };

  const handleTaskDragStart = (taskId: string, event: DragEvent<HTMLDivElement>): void => {
    taskList.onDrag(taskId, event.dataTransfer);
  };

  const handleColumnDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleColumnDrop = (event: DragEvent<HTMLDivElement>, status: TaskStatus): void => {
    event.preventDefault();
    const isMoved = taskList.onDrop(event.dataTransfer, status);

    if (isMoved) {
      refreshBoard();
    }
  };

  return (
    <div className="flex flex-col min-h-[60vh] md:min-h-[calc(100vh-8rem)] gap-4">
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 text-black overflow-hidden">
        <h2 className="w-full flex items-center px-4 pt-4 text-2xl sm:text-4xl">CICCC Board</h2>
        <SearchBar />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_TITLES.map((title) => (
          <KanbanColumn
            key={title}
            title={title}
            tasks={taskList.getByStatus(title)}
            onTaskDragStart={handleTaskDragStart}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
          />
        ))}
      </section>
    </div>
  );
}

export default KanbanBoard;
