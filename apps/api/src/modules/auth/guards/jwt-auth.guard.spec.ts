import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode, UserRole, UserStatus } from '@suluhu/shared';
import { AppException } from '../../../common/exceptions/app.exception';
import type { AccessTokenPayload, AuthenticatedRequest } from '../types';
import type { TokenService } from '../services/token.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class Handler {}

function payloadWith(status: string): AccessTokenPayload {
  return {
    sub: 'u1',
    email: 'asha@example.com',
    role: UserRole.PATIENT,
    status,
    mfaEnabled: true,
    jti: 'jti1',
  };
}

function build(options: { isPublic?: boolean; payload?: AccessTokenPayload; verifyError?: Error }) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(options.isPublic);
  const verifyAccessToken = jest.fn(() =>
    options.verifyError
      ? Promise.reject(options.verifyError)
      : Promise.resolve(options.payload ?? payloadWith(UserStatus.ACTIVE)),
  );
  const guard = new JwtAuthGuard(reflector, { verifyAccessToken } as unknown as TokenService);
  return { guard, verifyAccessToken };
}

function contextWith(authorization?: string): {
  context: ExecutionContext;
  request: AuthenticatedRequest;
} {
  const request = { headers: authorization ? { authorization } : {} } as AuthenticatedRequest;
  return {
    request,
    context: {
      getHandler: () => Handler.prototype.constructor,
      getClass: () => Handler,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
}

describe('JwtAuthGuard', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lets a @Public() route through without a token', async () => {
    const { guard, verifyAccessToken } = build({ isPublic: true });
    await expect(guard.canActivate(contextWith().context)).resolves.toBe(true);
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it('attaches the authenticated user and jti on a valid bearer token', async () => {
    const { guard, verifyAccessToken } = build({});
    const { context, request } = contextWith('Bearer token-1');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyAccessToken).toHaveBeenCalledWith('token-1');
    expect(request.user).toEqual({
      id: 'u1',
      email: 'asha@example.com',
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
      mfaEnabled: true,
    });
    expect(request.authJti).toBe('jti1');
  });

  it.each([undefined, 'token-1', 'Basic dXNlcjpwYXNz', 'Bearer'])(
    'rejects a request with authorization header %p',
    async (header) => {
      const { guard, verifyAccessToken } = build({});
      await expect(guard.canActivate(contextWith(header).context)).rejects.toMatchObject({
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Authentication required',
      });
      expect(verifyAccessToken).not.toHaveBeenCalled();
    },
  );

  it.each([UserStatus.SUSPENDED, UserStatus.DEACTIVATED])(
    'rejects a valid token for a %s account',
    async (status) => {
      const { guard } = build({ payload: payloadWith(status) });
      await expect(guard.canActivate(contextWith('Bearer token-1').context)).rejects.toMatchObject({
        code: ErrorCode.ACCOUNT_SUSPENDED,
        message: 'Account is not active',
      });
    },
  );

  it('propagates a token verification failure', async () => {
    const failure = AppException.unauthorized('Session expired', ErrorCode.AUTH_TOKEN_EXPIRED);
    const { guard } = build({ verifyError: failure });
    await expect(guard.canActivate(contextWith('Bearer token-1').context)).rejects.toBe(failure);
  });
});
