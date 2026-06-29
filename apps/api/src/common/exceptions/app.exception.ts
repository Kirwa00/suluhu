import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@suluhu/shared';

/**
 * Domain exception carrying a stable machine-readable code plus an HTTP status.
 * Use the static factories for common cases so codes stay consistent.
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message, status);
  }

  static badRequest(message: string, code: string = ErrorCode.VALIDATION_FAILED): AppException {
    return new AppException(code, message, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(
    message = 'Authentication required',
    code: string = ErrorCode.UNAUTHENTICATED,
  ): AppException {
    return new AppException(code, message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = 'You do not have access to this resource'): AppException {
    return new AppException(ErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }

  static notFound(message = 'Resource not found'): AppException {
    return new AppException(ErrorCode.NOT_FOUND, message, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string, code: string = ErrorCode.CONFLICT): AppException {
    return new AppException(code, message, HttpStatus.CONFLICT);
  }

  static validation(details: Record<string, string[]>, message = 'Validation failed'): AppException {
    return new AppException(ErrorCode.VALIDATION_FAILED, message, HttpStatus.BAD_REQUEST, details);
  }
}
