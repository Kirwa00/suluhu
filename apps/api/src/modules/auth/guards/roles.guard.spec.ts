import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode, UserRole } from '@suluhu/shared';
import { AppException } from '../../../common/exceptions/app.exception';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

class Handler {}

function contextWith(user?: { role: UserRole }): ExecutionContext {
  return {
    getHandler: () => Handler.prototype.constructor,
    getClass: () => Handler,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function requireRoles(roles: UserRole[] | undefined): void {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      expect(key).toBe(ROLES_KEY);
      return roles;
    });
  }

  it('allows the request when no roles are declared', () => {
    requireRoles(undefined);
    expect(guard.canActivate(contextWith())).toBe(true);
  });

  it('allows the request when the roles list is empty', () => {
    requireRoles([]);
    expect(guard.canActivate(contextWith())).toBe(true);
  });

  it('allows a user whose role is in the required list', () => {
    requireRoles([UserRole.ADMIN, UserRole.THERAPIST]);
    expect(guard.canActivate(contextWith({ role: UserRole.THERAPIST }))).toBe(true);
  });

  it('rejects a user whose role is not required', () => {
    requireRoles([UserRole.ADMIN]);
    expect(() => guard.canActivate(contextWith({ role: UserRole.PATIENT }))).toThrow(AppException);
  });

  it('rejects an unauthenticated request with a forbidden code', () => {
    requireRoles([UserRole.ADMIN]);
    try {
      guard.canActivate(contextWith());
      throw new Error('expected the guard to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppException);
      expect((error as AppException).code).toBe(ErrorCode.FORBIDDEN);
      expect((error as AppException).message).toBe(
        'You do not have permission to perform this action',
      );
    }
  });
});
