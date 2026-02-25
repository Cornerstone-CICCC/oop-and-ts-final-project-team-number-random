import type { User as FirebaseUser, Unsubscribe } from "firebase/auth";
import type { IUser, LoginCredentials, SignupCredentials } from "@/types";

/**
 * Authentication Service Interface
 * Defines the contract for authentication operations (DIP - Dependency Inversion)
 */
export type IAuthService = {
  /**
   * Sign up a new user with email and password
   * Creates both Firebase Auth user and Firestore profile
   */
  signUp(credentials: SignupCredentials): Promise<IUser>;

  /**
   * Sign in an existing user with email and password
   */
  signIn(credentials: LoginCredentials): Promise<IUser>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): Unsubscribe;

  /**
   * Get the current Firebase Auth user
   */
  getCurrentUser(): FirebaseUser | null;

  /**
   * Get user-friendly error message for authentication errors
   */
  getErrorMessage(error: unknown): string;
};
