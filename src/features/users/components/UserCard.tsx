import type { IUser } from "@/types";
import { formatDateShort } from "@/utils";
import { UserAvatar } from "./UserAvatar";

type UserCardProps = {
  user: IUser;
};

/**
 * UserCard Component
 * Displays individual user information in a card format
 */
export function UserCard({ user }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow transition-all group">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-medium truncate group-hover:text-indigo-700 transition-colors">{user.displayName}</h3>
          <p className="text-slate-500 text-sm truncate">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div>
          <span className="block text-slate-400">Joined</span>
          {formatDateShort(user.createdAt)}
        </div>
        <div>
          <span className="block text-slate-400">Last Login</span>
          {formatDateShort(user.lastLoginAt)}
        </div>
      </div>
    </div>
  );
}
