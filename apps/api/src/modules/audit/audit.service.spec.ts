import { Logger } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from './audit.service';

function build(createImpl?: jest.Mock) {
  const create = createImpl ?? jest.fn().mockResolvedValue({ id: 'a1' });
  const service = new AuditService({ auditLog: { create } } as unknown as PrismaService);
  return { service, create };
}

describe('AuditService', () => {
  it('writes the full entry as given', async () => {
    const { service, create } = build();
    await service.record({
      userId: 'u1',
      action: 'CLINICAL_NOTE_VIEWED',
      resourceType: 'ClinicalNote',
      resourceId: 'n1',
      phiAccessed: true,
      ipAddress: '41.90.1.1',
      userAgent: 'jest',
      metadata: { reason: 'continuity of care' },
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        action: 'CLINICAL_NOTE_VIEWED',
        resourceType: 'ClinicalNote',
        resourceId: 'n1',
        phiAccessed: true,
        ipAddress: '41.90.1.1',
        userAgent: 'jest',
        metadata: { reason: 'continuity of care' },
      },
    });
  });

  it('defaults optional fields for an anonymous, non-PHI action', async () => {
    const { service, create } = build();
    await service.record({ action: 'LOGIN_FAILED', resourceType: 'User' });
    expect(create).toHaveBeenCalledWith({
      data: {
        userId: null,
        action: 'LOGIN_FAILED',
        resourceType: 'User',
        resourceId: null,
        phiAccessed: false,
        ipAddress: null,
        userAgent: null,
        metadata: undefined,
      },
    });
  });

  it('logs but swallows a write failure so the caller is not broken', async () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { service } = build(jest.fn().mockRejectedValue(new Error('db down')));
    await expect(
      service.record({ action: 'LOGIN', resourceType: 'User' }),
    ).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      'Failed to write audit log for action=LOGIN',
      expect.stringContaining('db down'),
    );
    error.mockRestore();
  });

  it('stringifies a non-Error rejection for the log', async () => {
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { service } = build(jest.fn().mockRejectedValue('db down'));
    await service.record({ action: 'LOGIN', resourceType: 'User' });
    expect(error).toHaveBeenCalledWith(expect.any(String), 'db down');
    error.mockRestore();
  });
});
