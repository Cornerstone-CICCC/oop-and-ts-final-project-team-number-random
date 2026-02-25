import { AppError } from "./AppError";

/**
 * Not Found Error
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  readonly resourceType: string;
  readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(`${resourceType} not found: ${resourceId}`, "NOT_FOUND");
    this.name = "NotFoundError";
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}
