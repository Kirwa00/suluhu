import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

/**
 * M-Pesa (Safaricom Daraja) STK Push provider (SDLC §8.1).
 *
 * Production calls Daraja's STK Push endpoint and receives the result via the
 * `/payments/mpesa/callback` webhook. The mock simulates a successful push and
 * schedules an asynchronous "callback" so the full pending → confirmed flow is
 * exercised locally with no Safaricom credentials.
 */

export interface StkPushRequest {
  amountKsh: number;
  phone: string; // E.164 +2547...
  accountReference: string;
  description: string;
}

export interface StkPushResult {
  checkoutRequestId: string;
  merchantRequestId: string;
  customerMessage: string;
}

export interface MpesaProvider {
  readonly mode: 'mock' | 'live';
  initiateStkPush(req: StkPushRequest): Promise<StkPushResult>;
}

export const MPESA_PROVIDER = Symbol('MPESA_PROVIDER');

/** Callback the payments service registers so the mock can confirm a push. */
export type MpesaConfirmFn = (result: {
  checkoutRequestId: string;
  success: boolean;
  receipt?: string;
}) => Promise<void>;

export class MockMpesaProvider implements MpesaProvider {
  readonly mode = 'mock' as const;
  private readonly logger = new Logger('MockMpesa');
  private confirm: MpesaConfirmFn | null = null;

  /** The payments service injects its confirmation handler at startup. */
  registerConfirmHandler(fn: MpesaConfirmFn): void {
    this.confirm = fn;
  }

  async initiateStkPush(req: StkPushRequest): Promise<StkPushResult> {
    const checkoutRequestId = `ws_CO_${randomUUID()}`;
    this.logger.log(
      `STK Push → ${req.phone} for KES ${req.amountKsh} (${req.accountReference})`,
    );

    // Simulate the customer approving the prompt ~2s later, then fire the
    // callback exactly as Daraja would. Always succeeds in mock mode.
    setTimeout(() => {
      void this.confirm?.({
        checkoutRequestId,
        success: true,
        receipt: `MOCK${Date.now().toString().slice(-8)}`,
      });
    }, 2000);

    return {
      checkoutRequestId,
      merchantRequestId: randomUUID(),
      customerMessage: 'Enter your M-Pesa PIN on your phone to complete payment.',
    };
  }
}
