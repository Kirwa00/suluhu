import { Logger } from '@nestjs/common';
import { MockEmailProvider } from './providers/mock-email.provider';
import { MockSmsProvider } from './providers/mock-sms.provider';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let log: jest.SpyInstance;

  beforeEach(() => {
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('routes SMS to the SMS provider only', async () => {
    const sms = { send: jest.fn().mockResolvedValue({ providerMessageId: 's1', accepted: true }) };
    const email = { send: jest.fn() };
    const service = new NotificationsService(sms, email);

    const message = { to: '+254712345678', body: 'Your code is 123456' };
    await expect(service.sendSms(message)).resolves.toEqual({
      providerMessageId: 's1',
      accepted: true,
    });
    expect(sms.send).toHaveBeenCalledWith(message);
    expect(email.send).not.toHaveBeenCalled();
  });

  it('routes email to the email provider only', async () => {
    const sms = { send: jest.fn() };
    const email = {
      send: jest.fn().mockResolvedValue({ providerMessageId: 'e1', accepted: true }),
    };
    const service = new NotificationsService(sms, email);

    const message = { to: 'asha@example.com', subject: 'Hi', html: '<p>Hi</p>' };
    await service.sendEmail(message);
    expect(email.send).toHaveBeenCalledWith(message);
    expect(sms.send).not.toHaveBeenCalled();
  });

  it('accepts messages through the mock providers with unique ids', async () => {
    const service = new NotificationsService(new MockSmsProvider(), new MockEmailProvider());

    const sms = await service.sendSms({ to: '+254712345678', body: 'Your code is 123456' });
    const email = await service.sendEmail({
      to: 'asha@example.com',
      subject: 'Your Suluhu verification code',
      html: '<p>123456</p>',
      text: '123456',
    });

    expect(sms.accepted).toBe(true);
    expect(sms.providerMessageId).toMatch(/^mock-sms-.{10}$/);
    expect(email.accepted).toBe(true);
    expect(email.providerMessageId).toMatch(/^mock-email-.{10}$/);

    const second = await service.sendSms({ to: '+254712345678', body: 'again' });
    expect(second.providerMessageId).not.toBe(sms.providerMessageId);
  });

  it('logs the email text body, falling back to html', async () => {
    const provider = new MockEmailProvider();
    await provider.send({ to: 'asha@example.com', subject: 'Hi', html: '<p>fallback</p>' });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('<p>fallback</p>'));
  });
});
