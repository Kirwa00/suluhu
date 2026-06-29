import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '@suluhu/shared';
import type { Request } from 'express';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '@suluhu/shared';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService, toAuthUser } from '../services/token.service';
import type { AuthenticatedRequest } from '../types';

/**
 * Global authentication guard (Zero Trust — SDLC §7.1). Every route requires a
 * valid access token unless explicitly marked `@Public()`. Suspended/deactivated
 * accounts are rejected even with a valid token.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearer(request);
    if (!token) {
      throw AppException.unauthorized('Authentication required');
    }

    const payload = await this.tokenService.verifyAccessToken(token);

    if (payload.status === UserStatus.SUSPENDED || payload.status === UserStatus.DEACTIVATED) {
      throw AppException.unauthorized('Account is not active', ErrorCode.ACCOUNT_SUSPENDED);
    }

    request.user = toAuthUser({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      mfaEnabled: payload.mfaEnabled,
    });
    request.authJti = payload.jti;
    return true;
  }
}

function extractBearer(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  return scheme === 'Bearer' && value ? value : null;
}
