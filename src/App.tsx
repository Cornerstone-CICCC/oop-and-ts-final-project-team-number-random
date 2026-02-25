import { useState } from "react";
import { ServiceProvider } from "./services";
import { AuthProvider } from "./contexts";
import { useAuth } from "./hooks";
import { LoadingSpinner } from "./components/ui";
import { Header, type Page } from "./components/layouts";
import { AuthPage, UserListPage } from "./features/users";
import { KanbanBoard } from "./features/kanban";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("kanban");

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentPage === "kanban" && <KanbanBoard />}
        {currentPage === "users" && <UserListPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ServiceProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ServiceProvider>
  );
}

export default App;
