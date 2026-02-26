import { SearchBar } from "@/components";

export function KanbanBoard() {
  return (
    <div className="flex h-[60vh] md:h-[calc(100vh-8rem)]">

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full text-black">
        <h2 className="w-full flex items-center p-4 sm:text-4xl text-2xl">CICCC Board</h2>
        <SearchBar />
      </div>
    </div>
  );
}

export default KanbanBoard;
