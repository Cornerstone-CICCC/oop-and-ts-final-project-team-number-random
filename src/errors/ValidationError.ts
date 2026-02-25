import { AppError } from "./AppError";

/**
 * Validation Error
 * Used for form validation and input errors
 */
export class ValidationError extends AppError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", { severity: "warning" });
    this.name = "ValidationError";
    this.field = field;
  }
}
