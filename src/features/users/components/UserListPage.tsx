import { LoadingSpinner } from "@/components/ui";
import { useUserList } from "../hooks";
import { UserCard } from "./UserCard";

/**
 * UserListPage Component
 * Displays a list of all users in the system
 */
export function UserListPage() {
  const { users, isLoading, error, refetch } = useUserList();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800">{error}</p>
        <button
          onClick={refetch}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Users ({users.length})
        </h2>
        <button
          onClick={refetch}
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No users found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
