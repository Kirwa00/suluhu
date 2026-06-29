import { SessionsService } from './sessions.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import { MockVideoProvider } from './providers/video.provider';
import type { AuthUser } from '@suluhu/shared';

const PATIENT: AuthUser = { id: 'pat', email: 'p@x', role: 'PATIENT', status: 'ACTIVE', mfaEnabled: false };
const THERAPIST: AuthUser = { id: 'thr', email: 't@x', role: 'THERAPIST', status: 'ACTIVE', mfaEnabled: true };

function makeService(appt: Record<string, unknown>) {
  const prisma = {
    appointment: { findUnique: jest.fn().mockResolvedValue(appt) },
  } as unknown as PrismaService;
  const audit = { record: jest.fn() } as unknown as AuditService;
  return new SessionsService(prisma, audit, new MockVideoProvider());
}

function baseAppt(overrides: Record<string, unknown>) {
  return {
    id: 'appt1',
    patientId: 'pat',
    therapistId: 'thr',
    durationMins: 60,
    videoRoomName: 'suluhu-appt1-abcd',
    patient: { id: 'pat', firstName: 'Faith', lastName: 'C' },
    therapist: { id: 'thr', firstName: 'Daniel', lastName: 'K' },
    ...overrides,
  };
}

describe('SessionsService.getAccess', () => {
  it('is EARLY well before the start time', async () => {
    const svc = makeService(
      baseAppt({ status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 2 * 3600_000) }),
    );
    const res = await svc.getAccess('appt1', PATIENT);
    expect(res.phase).toBe('EARLY');
    expect(res.canJoin).toBe(false);
  });

  it('puts the patient in the WAITING room within the window before the therapist starts', async () => {
    const svc = makeService(
      baseAppt({ status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 5 * 60_000) }),
    );
    const res = await svc.getAccess('appt1', PATIENT);
    expect(res.phase).toBe('WAITING');
    expect(res.canJoin).toBe(false);
    expect(res.token).toBeUndefined();
  });

  it('lets the therapist be READY with a token in the window', async () => {
    const svc = makeService(
      baseAppt({ status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 5 * 60_000) }),
    );
    const res = await svc.getAccess('appt1', THERAPIST);
    expect(res.phase).toBe('READY');
    expect(res.canJoin).toBe(true);
    expect(res.token).toMatch(/^mockvt\./);
    expect(res.isOwner).toBe(true);
  });

  it('lets the patient join once IN_PROGRESS', async () => {
    const svc = makeService(
      baseAppt({ status: 'IN_PROGRESS', scheduledAt: new Date(Date.now() - 5 * 60_000) }),
    );
    const res = await svc.getAccess('appt1', PATIENT);
    expect(res.phase).toBe('IN_SESSION');
    expect(res.canJoin).toBe(true);
    expect(res.token).toBeDefined();
  });

  it('reports ENDED for completed sessions', async () => {
    const svc = makeService(
      baseAppt({ status: 'COMPLETED', scheduledAt: new Date(Date.now() - 2 * 3600_000) }),
    );
    const res = await svc.getAccess('appt1', PATIENT);
    expect(res.phase).toBe('ENDED');
  });

  it('forbids a non-party user', async () => {
    const svc = makeService(
      baseAppt({ status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 5 * 60_000) }),
    );
    await expect(
      svc.getAccess('appt1', { ...PATIENT, id: 'intruder' }),
    ).rejects.toThrow();
  });
});
