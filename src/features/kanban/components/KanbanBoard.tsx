export function KanbanBoard() {
  return (
    <div className="flex h-[60vh] md:h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full flex items-center justify-center text-slate-400">
        <p className="text-lg">Kanban Board Area</p>
      </div>
    </div>
  );
}

export default KanbanBoard;
