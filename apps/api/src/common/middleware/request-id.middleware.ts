import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

declare module 'express' {
  interface Request {
    requestId?: string;
  }
}

/**
 * Assigns or propagates a correlation id for every request, echoed in the
 * `X-Request-Id` response header and the API envelope for tracing.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header('x-request-id');
    const id = incoming && incoming.length <= 64 ? incoming : nanoid();
    req.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  }
}
