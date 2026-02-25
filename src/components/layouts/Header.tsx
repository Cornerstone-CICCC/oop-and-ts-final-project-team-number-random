import { useState } from "react";
import { UserMenu } from "@/features/users";
import { cn } from "@/utils";

export type Page = "kanban" | "users";

type HeaderProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navButtonClass = (page: Page) =>
    cn(
      "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
      currentPage === page
        ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-700/10"
        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
    );

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4 md:gap-6">
          <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Kanban Board
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1">
            <button onClick={() => onNavigate("kanban")} className={navButtonClass("kanban")}>
              Board
            </button>
            <button onClick={() => onNavigate("users")} className={navButtonClass("users")}>
              Users
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <UserMenu />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -m-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onNavigate("kanban");
                setIsMobileMenuOpen(false);
              }}
              className={cn(navButtonClass("kanban"), "w-full text-left")}
            >
              Board
            </button>
            <button
              onClick={() => {
                onNavigate("users");
                setIsMobileMenuOpen(false);
              }}
              className={cn(navButtonClass("users"), "w-full text-left")}
            >
              Users
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
