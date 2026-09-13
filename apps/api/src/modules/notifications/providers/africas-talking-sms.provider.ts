import { Logger } from '@nestjs/common';
import type { SendResult, SmsMessage, SmsProvider } from './notification.types';

/**
 * Africa's Talking SMS — live provider. Reference:
 * https://developers.africastalking.com/docs/sms/sending/bulk
 *
 * The sandbox app (username "sandbox") talks to a different host than a
 * production app, so the base URL is derived from the username rather than
 * hardcoded — this lets SMS_MODE=live safely point at either.
 */

export interface AfricasTalkingConfig {
  username: string;
  apiKey: string;
  senderId?: string;
}

interface Recipient {
  number: string;
  status: string;
  statusCode: number;
  messageId?: string;
  cost?: string;
}

interface SendResponse {
  SMSMessageData?: {
    Message: string;
    Recipients: Recipient[];
  };
}

function baseUrlFor(username: string): string {
  return username === 'sandbox'
    ? 'https://api.sandbox.africastalking.com'
    : 'https://api.africastalking.com';
}

export class AfricasTalkingSmsProvider implements SmsProvider {
  private readonly logger = new Logger('AfricasTalkingSMS');
  private readonly baseUrl: string;

  constructor(private readonly config: AfricasTalkingConfig) {
    this.baseUrl = baseUrlFor(config.username);
  }

  async send(message: SmsMessage): Promise<SendResult> {
    const params = new URLSearchParams({
      username: this.config.username,
      to: message.to,
      message: message.body,
    });
    if (this.config.senderId) params.set('from', this.config.senderId);

    const res = await fetch(`${this.baseUrl}/version1/messaging`, {
      method: 'POST',
      headers: {
        apiKey: this.config.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    const raw = await res.text();
    if (!res.ok) {
      this.logger.error(`Africa's Talking send failed (${res.status}): ${raw}`);
      throw new Error(`Africa's Talking SMS send failed with status ${res.status}`);
    }

    let parsed: SendResponse;
    try {
      parsed = JSON.parse(raw) as SendResponse;
    } catch {
      this.logger.error(`Africa's Talking returned a non-JSON response: ${raw}`);
      throw new Error("Africa's Talking SMS send returned an unparseable response");
    }

    const recipient = parsed.SMSMessageData?.Recipients?.[0];
    if (!recipient) {
      this.logger.error(`Africa's Talking response had no recipient entry: ${raw}`);
      throw new Error("Africa's Talking SMS send returned no recipient status");
    }

    const accepted = recipient.statusCode === 101 || recipient.statusCode === 100;
    if (!accepted) {
      this.logger.warn(`SMS to ${message.to} not accepted: ${recipient.status}`);
    } else {
      this.logger.log(`SMS → ${message.to}: accepted (${recipient.status})`);
    }

    return { providerMessageId: recipient.messageId ?? '', accepted };
  }
}
