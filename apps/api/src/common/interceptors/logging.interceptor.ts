import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * Structured access logging. Logs method, path, status, and duration with the
 * correlation id. PHI is never logged (only resource paths and timings).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { requestId?: string }>();
    const res = http.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () =>
          this.logger.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms [${req.requestId}]`,
          ),
        error: () =>
          this.logger.warn(
            `${req.method} ${req.originalUrl} errored after ${Date.now() - start}ms [${req.requestId}]`,
          ),
      }),
    );
  }
}
