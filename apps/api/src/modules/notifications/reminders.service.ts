import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AppointmentStatus, REMINDER_OFFSETS_MINUTES } from '@suluhu/shared';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const QUEUE_NAME = 'appointment-reminders';

interface ReminderJob {
  appointmentId: string;
  offsetMins: number;
}

/**
 * Appointment reminders (SDLC §3.4) — schedules SMS/email reminders at 24h, 1h
 * and 15min before each session using BullMQ delayed jobs, and a worker that
 * sends them (skipping cancelled appointments) and logs each to `notifications`.
 */
@Injectable()
export class RemindersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RemindersService.name);
  private queue!: Queue<ReminderJob>;
  private worker!: Worker<ReminderJob>;
  private connection!: IORedis;

  constructor(
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit(): void {
    // BullMQ requires maxRetriesPerRequest: null on its connection.
    this.connection = new IORedis(this.config.redis.url, { maxRetriesPerRequest: null });
    this.connection.on('error', (e) => this.logger.error(`Reminders Redis error: ${e.message}`));
    const connection = this.connection as unknown as ConnectionOptions;

    this.queue = new Queue<ReminderJob>(QUEUE_NAME, { connection });
    this.worker = new Worker<ReminderJob>(QUEUE_NAME, (job) => this.process(job.data), {
      connection,
    });
    this.worker.on('failed', (job, err) =>
      this.logger.warn(`Reminder job ${job?.id} failed: ${err.message}`),
    );
    this.logger.log('Appointment reminder worker started');
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
    await this.connection?.quit();
  }

  /** Schedule the three reminders for a confirmed appointment. */
  async scheduleForAppointment(appointmentId: string, scheduledAt: Date): Promise<void> {
    const now = Date.now();
    for (const offsetMins of REMINDER_OFFSETS_MINUTES) {
      const delay = scheduledAt.getTime() - offsetMins * 60_000 - now;
      if (delay <= 0) continue; // window already passed
      await this.queue.add(
        'reminder',
        { appointmentId, offsetMins },
        {
          delay,
          jobId: `${appointmentId}:${offsetMins}`,
          removeOnComplete: true,
          removeOnFail: 100,
        },
      );
    }
  }

  /** Cancel any pending reminders (e.g. when an appointment is cancelled). */
  async cancelForAppointment(appointmentId: string): Promise<void> {
    for (const offsetMins of REMINDER_OFFSETS_MINUTES) {
      const job = await this.queue.getJob(`${appointmentId}:${offsetMins}`);
      await job?.remove().catch(() => undefined);
    }
  }

  async stats() {
    return this.queue.getJobCounts('waiting', 'delayed', 'active', 'completed', 'failed');
  }

  private async process(data: ReminderJob): Promise<void> {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: {
        patient: { select: { id: true, phone: true, email: true, firstName: true } },
        therapist: { select: { firstName: true, lastName: true } },
      },
    });
    if (!appt || appt.status !== AppointmentStatus.SCHEDULED) return;

    const when = appt.scheduledAt.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const label = this.label(data.offsetMins);
    const body = `Reminder: your Suluhu session with ${appt.therapist.firstName} ${appt.therapist.lastName} is in ${label} (${when} EAT).`;

    await this.notifications.sendSms({ to: appt.patient.phone, body });
    await this.prisma.notification.create({
      data: {
        userId: appt.patient.id,
        channel: 'SMS',
        template: `appointment_reminder_${data.offsetMins}m`,
        status: 'SENT',
        sentAt: new Date(),
        payload: { appointmentId: appt.id, offsetMins: data.offsetMins },
      },
    });
    this.logger.log(`Sent ${label} reminder for appointment ${appt.id}`);
  }

  private label(offsetMins: number): string {
    if (offsetMins >= 1440) return '24 hours';
    if (offsetMins >= 60) return '1 hour';
    return `${offsetMins} minutes`;
  }
}
