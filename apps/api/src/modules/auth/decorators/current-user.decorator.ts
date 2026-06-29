import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@suluhu/shared';
import type { AuthenticatedRequest } from '../types';

/**
 * Injects the authenticated principal (set by JwtAuthGuard). Optionally pass a
 * key to pluck a single field, e.g. `@CurrentUser('id') id: string`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return data ? request.user?.[data] : request.user;
  },
);
