import type { DragEvent } from "react";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@mui/material";
import { TaskCard } from "@/features/tasks";
import type { Task, TaskStatus } from "@/types";

type KanbanColumnProps = {
  title: TaskStatus;
  tasks: Task[];
  onTaskDragStart: (taskId: string, event: DragEvent<HTMLDivElement>) => void;
  onColumnDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onColumnDrop: (event: DragEvent<HTMLDivElement>, status: TaskStatus) => void;
};

type AddDropZoneProps = {
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
};

function AddDropZone(props: AddDropZoneProps) {
  const { onDragOver, onDrop } = props;

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center min-h-24"
    >
      <AddIcon className="text-slate-500" />
    </div>
  );
}

export function KanbanColumn(props: KanbanColumnProps) {
  const { title, tasks, onTaskDragStart, onColumnDragOver, onColumnDrop } = props;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-4 min-h-80 md:min-h-100 flex flex-col">
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center">
          <IconButton aria-label={`add task to ${title.toLowerCase()}`} size="small">
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label={`open ${title.toLowerCase()} options`} size="small">
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </div>
      </header>

      <div className="space-y-3 min-h-40 flex flex-col">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDragStart={onTaskDragStart} />
        ))}

        <AddDropZone
          onDragOver={onColumnDragOver}
          onDrop={(event) => onColumnDrop(event, title)}
        />
      </div>
    </div>
  );
}
