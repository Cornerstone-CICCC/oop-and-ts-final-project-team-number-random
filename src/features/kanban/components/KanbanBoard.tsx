import { SearchBar } from "@/components";
import { KanbanColumn } from "./KanbanColumn";

const COLUMN_TITLES = ["To Do", "In Progress", "Done"] as const;

export function KanbanBoard() {
  return (
    <div className="flex flex-col min-h-[60vh] md:min-h-[calc(100vh-8rem)] gap-4">
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 text-black overflow-hidden">
        <h2 className="w-full flex items-center px-4 pt-4 text-2xl sm:text-4xl">CICCC Board</h2>
        <SearchBar />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_TITLES.map((title) => (
          <KanbanColumn key={title} title={title} />
        ))}
      </section>
    </div>
  );
}

export default KanbanBoard;
