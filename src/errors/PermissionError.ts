import { AppError } from "./AppError";

/**
 * Permission Error
 * Used when user doesn't have required permissions
 */
export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, "PERMISSION_DENIED");
    this.name = "PermissionError";
  }
}
