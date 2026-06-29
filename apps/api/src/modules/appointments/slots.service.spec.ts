import { SlotsService } from './slots.service';
import type { PrismaService } from '../../prisma/prisma.service';

const FUTURE_DATE = '2031-06-10';
const weekday = new Date(`${FUTURE_DATE}T12:00:00+03:00`).getUTCDay();

function makePrisma(overrides: { availability?: unknown[]; booked?: unknown[] } = {}) {
  return {
    therapistProfile: {
      findFirst: jest.fn().mockResolvedValue({
        id: 't1',
        userId: 'u1',
        verificationStatus: 'APPROVED',
        availability: overrides.availability ?? [
          { dayOfWeek: weekday, startTime: '09:00', endTime: '12:00', isAvailable: true },
        ],
      }),
    },
    appointment: {
      findMany: jest.fn().mockResolvedValue(overrides.booked ?? []),
    },
  } as unknown as PrismaService;
}

describe('SlotsService', () => {
  it('generates hourly slots within an availability window', async () => {
    const service = new SlotsService(makePrisma());
    const days = await service.getSlots('t1', {
      from: FUTURE_DATE,
      to: FUTURE_DATE,
      durationMins: 60,
    });
    expect(days).toHaveLength(1);
    expect(days[0]?.slots).toHaveLength(3); // 09:00, 10:00, 11:00 EAT
    // 09:00 EAT == 06:00 UTC
    expect(days[0]?.slots[0]).toBe(`${FUTURE_DATE}T06:00:00.000Z`);
  });

  it('excludes slots that conflict with existing bookings', async () => {
    const tenAmEat = new Date(`${FUTURE_DATE}T10:00:00+03:00`);
    const service = new SlotsService(
      makePrisma({ booked: [{ scheduledAt: tenAmEat, durationMins: 60 }] }),
    );
    const days = await service.getSlots('t1', {
      from: FUTURE_DATE,
      to: FUTURE_DATE,
      durationMins: 60,
    });
    expect(days[0]?.slots).toHaveLength(2); // 10:00 removed
    expect(days[0]?.slots).not.toContain(`${FUTURE_DATE}T07:00:00.000Z`);
  });

  it('returns no slots for a day without availability', async () => {
    const service = new SlotsService(
      makePrisma({ availability: [{ dayOfWeek: (weekday + 1) % 7, startTime: '09:00', endTime: '12:00', isAvailable: true }] }),
    );
    const days = await service.getSlots('t1', {
      from: FUTURE_DATE,
      to: FUTURE_DATE,
      durationMins: 60,
    });
    expect(days).toHaveLength(0);
  });
});
