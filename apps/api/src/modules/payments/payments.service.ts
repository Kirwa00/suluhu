import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppointmentStatus, PaymentMethod, PaymentStatus } from '@suluhu/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';
import { NotificationsService } from '../notifications/notifications.service';
import { RemindersService } from '../notifications/reminders.service';
import { MockMpesaProvider, MPESA_PROVIDER, type MpesaProvider } from './providers/mpesa.provider';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly reminders: RemindersService,
    @Inject(MPESA_PROVIDER) private readonly mpesa: MpesaProvider,
  ) {}

  onModuleInit(): void {
    // Wire the mock provider's simulated callback back into completion.
    if (this.mpesa instanceof MockMpesaProvider) {
      this.mpesa.registerConfirmHandler((r) => this.completeByCheckout(r));
    }
  }

  /** Creates a pending payment and triggers an M-Pesa STK Push. */
  async initiateMpesa(params: {
    appointmentId: string;
    amountKsh: number;
    phone: string;
    reference: string;
  }): Promise<{ checkoutRequestId: string; customerMessage: string }> {
    const payment = await this.prisma.payment.create({
      data: {
        appointmentId: params.appointmentId,
        amountKsh: params.amountKsh,
        method: PaymentMethod.MPESA,
        status: PaymentStatus.PENDING,
        payerPhone: params.phone,
      },
    });

    const push = await this.mpesa.initiateStkPush({
      amountKsh: params.amountKsh,
      phone: params.phone,
      accountReference: params.reference,
      description: 'Suluhu therapy session',
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PROCESSING, mpesaCheckoutId: push.checkoutRequestId },
    });

    return { checkoutRequestId: push.checkoutRequestId, customerMessage: push.customerMessage };
  }

  /** Records an immediately-settled free session (no external payment). */
  async recordFreeSession(appointmentId: string): Promise<void> {
    await this.prisma.payment.create({
      data: {
        appointmentId,
        amountKsh: 0,
        method: PaymentMethod.FREE_SESSION,
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
      },
    });
  }

  /** Completes (or fails) a payment by its STK checkout id and activates the appointment. */
  async completeByCheckout(result: {
    checkoutRequestId: string;
    success: boolean;
    receipt?: string;
  }): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { mpesaCheckoutId: result.checkoutRequestId },
      include: { appointment: { include: { patient: true } } },
    });
    if (!payment) {
      this.logger.warn(`Callback for unknown checkout ${result.checkoutRequestId}`);
      return;
    }
    if (payment.status === PaymentStatus.SUCCEEDED) return; // idempotent

    if (!result.success) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failureReason: 'Payment was not completed' },
      });
      return;
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCEEDED, paidAt: new Date(), mpesaReceipt: result.receipt },
      }),
      this.prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: AppointmentStatus.SCHEDULED },
      }),
    ]);

    await this.sendConfirmation(payment.appointment.patient, payment.appointment.scheduledAt);
    await this.reminders.scheduleForAppointment(
      payment.appointmentId,
      payment.appointment.scheduledAt,
    );
    this.logger.log(`Payment confirmed for appointment ${payment.appointmentId}`);
  }

  /** Parses a Safaricom Daraja STK callback and completes the payment. */
  async handleDarajaCallback(body: unknown): Promise<void> {
    const stk = (body as { Body?: { stkCallback?: DarajaStkCallback } })?.Body?.stkCallback;
    if (!stk?.CheckoutRequestID) {
      this.logger.warn('Received malformed M-Pesa callback');
      return;
    }
    const success = stk.ResultCode === 0;
    const receipt = stk.CallbackMetadata?.Item?.find(
      (i) => i.Name === 'MpesaReceiptNumber',
    )?.Value as string | undefined;
    await this.completeByCheckout({
      checkoutRequestId: stk.CheckoutRequestID,
      success,
      receipt,
    });
  }

  getByAppointment(appointmentId: string) {
    return this.prisma.payment.findUnique({ where: { appointmentId } });
  }

  /** Payment status for an appointment, enforcing that the caller is a party to it. */
  async getStatusForUser(appointmentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { appointmentId },
      include: { appointment: { select: { patientId: true, therapistId: true, status: true } } },
    });
    if (!payment) throw AppException.notFound('Payment not found');
    const appt = payment.appointment;
    if (appt.patientId !== userId && appt.therapistId !== userId) {
      throw AppException.forbidden();
    }
    return {
      paymentStatus: payment.status,
      method: payment.method,
      amountKsh: payment.amountKsh,
      paidAt: payment.paidAt,
      appointmentStatus: appt.status,
    };
  }

  private async sendConfirmation(
    patient: { email: string; phone: string; firstName: string },
    scheduledAt: Date,
  ): Promise<void> {
    const when = scheduledAt.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    const body = `Hi ${patient.firstName}, your Suluhu session is confirmed for ${when} EAT. We look forward to supporting you.`;
    await Promise.all([
      this.notifications.sendSms({ to: patient.phone, body }),
      this.notifications.sendEmail({
        to: patient.email,
        subject: 'Your Suluhu session is confirmed',
        text: body,
        html: `<p>${body}</p>`,
      }),
    ]);
  }
}

interface DarajaStkCallback {
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc?: string;
  CallbackMetadata?: { Item?: { Name: string; Value?: string | number }[] };
}
