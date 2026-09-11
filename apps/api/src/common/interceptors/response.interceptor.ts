import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { API_VERSION, type ApiResponse } from '@suluhu/shared';
import type { Request } from 'express';
import { Observable, map } from 'rxjs';

/**
 * Wraps every successful controller result in the standard API envelope
 * (SDLC §9.1). Controllers return plain data; the envelope is added here.
 *
 * A `StreamableFile` (binary downloads, e.g. therapist documents) passes
 * through untouched — Nest's HTTP adapter pipes it directly and expects to
 * receive the StreamableFile instance itself, not an envelope wrapping it.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | StreamableFile> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | StreamableFile> {
    const request = context.switchToHttp().getRequest<Request & { requestId?: string }>();
    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) return data;
        return {
          success: true,
          data: data ?? null,
          meta: {
            timestamp: new Date().toISOString(),
            version: API_VERSION,
            requestId: request.requestId,
          },
          error: null,
        };
      }),
    );
  }
}
