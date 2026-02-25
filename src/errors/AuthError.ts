import { AppError } from "./AppError";

/**
 * Authentication Error
 * Used for all auth-related errors (login, signup, session)
 */
export class AuthError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "AUTH_ERROR", { originalError });
    this.name = "AuthError";
  }
}
