import { HTTP_STATUS } from "../constants";
import { BaseError } from "./base_error";

export class NotFoundError extends BaseError {
  constructor(entity: string, id?: string | number) {
    super(
      `
            ${entity}${id ? ` with id ${id}` : ""} not found    
        `,
      HTTP_STATUS.NOT_FOUND,
    );
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: unknown) {
    super(message, HTTP_STATUS.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized access") {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Access forbidden") {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}
