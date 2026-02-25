import { AppError } from "./AppError";

/**
 * Network Error
 * Used for connection failures, timeouts, and service unavailability
 */
export class NetworkError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "NETWORK_ERROR", { originalError });
    this.name = "NetworkError";
  }
}
