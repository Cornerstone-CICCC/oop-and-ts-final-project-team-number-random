import type { IUser, UpdateProfileDTO } from "@/types";

/**
 * Profile Service Interface
 * Defines the contract for user profile operations (DIP - Dependency Inversion)
 */
export type IProfileService = {
  /**
   * Get a user profile by ID
   */
  getProfile(userId: string): Promise<IUser>;

  /**
   * Get all user profiles
   */
  getAllProfiles(): Promise<IUser[]>;

  /**
   * Update a user's profile
   */
  updateProfile(userId: string, data: UpdateProfileDTO): Promise<IUser>;

  /**
   * Delete a user account completely (Auth + Firestore)
   */
  deleteAccount(userId: string): Promise<void>;
};
