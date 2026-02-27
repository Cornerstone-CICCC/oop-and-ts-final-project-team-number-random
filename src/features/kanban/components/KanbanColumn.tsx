import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@mui/material";

type KanbanColumnProps = {
  title: string;
};

export function KanbanColumn({ title }: KanbanColumnProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 min-h-80 md:min-h-110">
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

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 min-h-24 sm:min-h-32 md:min-h-40" />
    </article>
  );
}
