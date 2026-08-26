import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@suluhu/shared';
import { AppException } from './app.exception';

describe('AppException factories', () => {
  it('defaults badRequest to the validation code', () => {
    const ex = AppException.badRequest('Invalid input');
    expect(ex.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(ex.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(ex.message).toBe('Invalid input');
    expect(ex.details).toBeUndefined();
  });

  it('allows overriding the code on badRequest', () => {
    expect(AppException.badRequest('No code', ErrorCode.AUTH_OTP_INVALID).code).toBe(
      ErrorCode.AUTH_OTP_INVALID,
    );
  });

  it('defaults unauthorized to the unauthenticated code and message', () => {
    const ex = AppException.unauthorized();
    expect(ex.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(ex.code).toBe(ErrorCode.UNAUTHENTICATED);
    expect(ex.message).toBe('Authentication required');
  });

  it('carries a specific auth code when unauthorized', () => {
    expect(AppException.unauthorized('Expired', ErrorCode.AUTH_TOKEN_EXPIRED).code).toBe(
      ErrorCode.AUTH_TOKEN_EXPIRED,
    );
  });

  it('builds forbidden and notFound with default messages', () => {
    const forbidden = AppException.forbidden();
    expect([forbidden.getStatus(), forbidden.code]).toEqual([
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN,
    ]);
    expect(forbidden.message).toBe('You do not have access to this resource');

    const notFound = AppException.notFound();
    expect([notFound.getStatus(), notFound.code]).toEqual([
      HttpStatus.NOT_FOUND,
      ErrorCode.NOT_FOUND,
    ]);
    expect(notFound.message).toBe('Resource not found');
  });

  it('builds conflict with an overridable code', () => {
    expect(AppException.conflict('Email taken', ErrorCode.AUTH_EMAIL_TAKEN)).toMatchObject({
      code: ErrorCode.AUTH_EMAIL_TAKEN,
      message: 'Email taken',
    });
    expect(AppException.conflict('Clash').code).toBe(ErrorCode.CONFLICT);
  });

  it('attaches field-level details to validation errors', () => {
    const details = { email: ['Enter a valid email address'] };
    const ex = AppException.validation(details);
    expect(ex.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(ex.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(ex.message).toBe('Validation failed');
    expect(ex.details).toBe(details);
  });
});
