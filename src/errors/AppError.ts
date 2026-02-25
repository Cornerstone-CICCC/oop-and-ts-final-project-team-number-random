/**
 * Application Error Codes
 * Used for categorizing errors throughout the application
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Error Severity Levels
 * - warning: User can retry or fix (validation errors)
 * - error: Something went wrong but app continues
 * - critical: App cannot continue safely
 */
export type ErrorSeverity = "warning" | "error" | "critical";

/**
 * Base Application Error
 * All application-specific errors extend this class
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly severity: ErrorSeverity;
  readonly originalError?: unknown;
  readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    options?: {
      severity?: ErrorSeverity;
      originalError?: unknown;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.severity = options?.severity ?? "error";
    this.originalError = options?.originalError;
    this.timestamp = new Date();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
