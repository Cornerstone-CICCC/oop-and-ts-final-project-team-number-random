import { useAuth } from "@/hooks";
import { UserAvatar } from "./UserAvatar";

/**
 * UserMenu Component
 * Displays user info and sign out button (SRP)
 */
export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <UserAvatar user={user} size="md" />
        <span className="text-sm text-slate-700 font-medium hidden sm:block">
          {user.displayName}
        </span>
      </div>

      <button
        onClick={() => signOut()}
        className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
