import { useState, useEffect, useCallback } from "react";
import type { IUser } from "@/types";
import { userService } from "@/services/UserService";

type UseUserListReturn = {
  users: IUser[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * useUserList Hook
 * Fetches and manages the list of all users
 */
export function useUserList(): UseUserListReturn {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
