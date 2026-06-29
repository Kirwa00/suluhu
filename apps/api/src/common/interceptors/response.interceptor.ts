import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { API_VERSION, type ApiResponse } from '@suluhu/shared';
import type { Request } from 'express';
import { Observable, map } from 'rxjs';

/**
 * Wraps every successful controller result in the standard API envelope
 * (SDLC §9.1). Controllers return plain data; the envelope is added here.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request & { requestId?: string }>();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data ?? null,
        meta: {
          timestamp: new Date().toISOString(),
          version: API_VERSION,
          requestId: request.requestId,
        },
        error: null,
      })),
    );
  }
}
