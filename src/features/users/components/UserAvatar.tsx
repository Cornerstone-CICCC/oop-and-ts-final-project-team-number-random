import type { IUser } from "@/types";

type UserAvatarProps = {
  user: IUser;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-12 h-12 text-lg",
};

/**
 * UserAvatar Component
 * Displays user avatar or initials (SRP - Single Responsibility)
 */
export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium overflow-hidden`}
    >
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        user.displayName.charAt(0).toUpperCase()
      )}
    </div>
  );
}
