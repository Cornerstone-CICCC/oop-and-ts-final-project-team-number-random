import type { Timestamp } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";

/**
 * Firestore User Document Structure
 * This is the raw data stored in the /users/{userId} collection
 */
export type UserDocument = {
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
};

/**
 * Application-level User Type
 * Timestamps are converted to Date objects for easier manipulation
 */
export type IUser = {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
};

/**
 * Authentication State
 * Represents the current authentication status of the user
 */
export type AuthState = {
  user: IUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

/**
 * Login Credentials
 * Data required for user sign-in
 */
export type LoginCredentials = {
  email: string;
  password: string;
};

/**
 * Signup Credentials
 * Data required for new user registration
 */
export type SignupCredentials = {
  email: string;
  password: string;
  displayName: string;
};

/**
 * Update Profile DTO
 * Data that can be updated in user profile
 */
export type UpdateProfileDTO = {
  displayName?: string;
  photoURL?: string | null;
};

/**
 * Firebase Auth Error Codes
 * Common error codes returned by Firebase Authentication
 */
export type FirebaseAuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/operation-not-allowed"
  | "auth/weak-password"
  | "auth/user-disabled"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-credential"
  | "auth/too-many-requests"
  | "auth/requires-recent-login";

/**
 * User-friendly error messages for Firebase Auth errors
 */
export const AUTH_ERROR_MESSAGES: Record<FirebaseAuthErrorCode, string> = {
  "auth/email-already-in-use": "This email is already registered",
  "auth/invalid-email": "Invalid email address",
  "auth/operation-not-allowed": "Email/password accounts are not enabled",
  "auth/weak-password": "Password is too weak (minimum 6 characters)",
  "auth/user-disabled": "This account has been disabled",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Incorrect password",
  "auth/invalid-credential": "Invalid email or password",
  "auth/too-many-requests": "Too many failed attempts. Please try again later",
  "auth/requires-recent-login": "Please sign in again to perform this action",
};
