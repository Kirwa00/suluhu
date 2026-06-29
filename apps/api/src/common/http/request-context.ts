import type { Request } from 'express';
import type { RequestContext } from '../../modules/auth/types';

/** Extracts client IP + user agent for audit logging. */
export function buildRequestContext(req: Request): RequestContext {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = Array.isArray(forwarded)
    ? forwarded[0]
    : (forwarded?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? null);
  return { ipAddress, userAgent: req.headers['user-agent'] ?? null };
}
