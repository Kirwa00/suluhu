/** Contracts for outbound notification channels (SDLC §8.2). */

export interface SmsMessage {
  to: string; // E.164
  body: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendResult {
  providerMessageId: string;
  accepted: boolean;
}

export interface SmsProvider {
  send(message: SmsMessage): Promise<SendResult>;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<SendResult>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
