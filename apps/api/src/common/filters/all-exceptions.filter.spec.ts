import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { API_VERSION, ErrorCode } from '@suluhu/shared';
import { AppException } from '../exceptions/app.exception';
import { AllExceptionsFilter } from './all-exceptions.filter';

type Envelope = {
  success: boolean;
  data: null;
  meta: { timestamp: string; version: string; requestId?: string };
  error: { code: string; message: string; details?: Record<string, string[]> };
};

function knownRequestError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('db failure', {
    code,
    clientVersion: '5.0.0',
  });
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;
  let errorLog: jest.SpyInstance;
  let warnLog: jest.SpyInstance;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'POST', url: '/v1/appointments', requestId: 'req1' }),
      }),
    } as unknown as ArgumentsHost;
    errorLog = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    warnLog = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function caught(exception: unknown): { httpStatus: number; body: Envelope } {
    filter.catch(exception, host);
    return {
      httpStatus: status.mock.calls[0][0] as number,
      body: json.mock.calls[0][0] as Envelope,
    };
  }

  it('passes an AppException through with its code and details', () => {
    const { httpStatus, body } = caught(AppException.validation({ email: ['Invalid'] }));
    expect(httpStatus).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toMatchObject({
      success: false,
      data: null,
      meta: { version: API_VERSION, requestId: 'req1' },
      error: {
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Validation failed',
        details: { email: ['Invalid'] },
      },
    });
  });

  it.each([
    [new NotFoundException('Missing'), HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND],
    [new ForbiddenException('Nope'), HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN],
    [
      new HttpException('Slow down', HttpStatus.TOO_MANY_REQUESTS),
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCode.RATE_LIMITED,
    ],
    [
      new HttpException('Teapot', HttpStatus.I_AM_A_TEAPOT),
      HttpStatus.I_AM_A_TEAPOT,
      ErrorCode.INTERNAL,
    ],
  ])('maps HttpException status %# to an error code', (exception, expectedStatus, expectedCode) => {
    const { httpStatus, body } = caught(exception);
    expect(httpStatus).toBe(expectedStatus);
    expect(body.error.code).toBe(expectedCode);
  });

  it('joins the array message Nest puts on validation errors', () => {
    const { body } = caught(new BadRequestException(['email is invalid', 'name is required']));
    expect(body.error).toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      message: 'email is invalid; name is required',
    });
    expect(body.error.details).toBeUndefined();
  });

  it('translates a unique-constraint violation into a conflict', () => {
    const { httpStatus, body } = caught(knownRequestError('P2002'));
    expect(httpStatus).toBe(HttpStatus.CONFLICT);
    expect(body.error).toMatchObject({
      code: ErrorCode.CONFLICT,
      message: 'A record with these details already exists',
    });
  });

  it('translates a missing-record error into a 404', () => {
    const { httpStatus, body } = caught(knownRequestError('P2025'));
    expect(httpStatus).toBe(HttpStatus.NOT_FOUND);
    expect(body.error.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('hides unmapped Prisma failures behind a generic 500', () => {
    const { httpStatus, body } = caught(knownRequestError('P2003'));
    expect(httpStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.error).toEqual({
      code: ErrorCode.INTERNAL,
      message: 'An unexpected error occurred. Please try again.',
      details: undefined,
    });
  });

  it('never leaks the message or stack of an unknown error', () => {
    const { httpStatus, body } = caught(new Error('connection string user:password@host'));
    expect(httpStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.error.message).toBe('An unexpected error occurred. Please try again.');
    expect(JSON.stringify(body)).not.toContain('password@host');
  });

  it('logs 5xx failures at error level and 4xx at warn level', () => {
    caught(new Error('boom'));
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(warnLog).not.toHaveBeenCalled();

    json.mockClear();
    status.mockClear();
    caught(AppException.notFound());
    expect(warnLog).toHaveBeenCalledTimes(1);
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it('stringifies a non-Error throwable for the server log', () => {
    caught('kaboom');
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('500'), 'kaboom');
  });
});
