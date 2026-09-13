import { Logger } from '@nestjs/common';
import { SmtpEmailProvider } from './smtp-email.provider';

const sendMail = jest.fn();
const createTransport = jest.fn((_config?: unknown) => ({ sendMail }));

jest.mock('nodemailer', () => ({
  createTransport: (config: unknown) => createTransport(config),
}));

const CONFIG = {
  host: 'smtp.example.com',
  port: 587,
  user: 'apikey',
  password: 'secret',
  from: 'Suluhu Therapy Center <no-reply@suluhu.co.ke>',
};

const MESSAGE = {
  to: 'patient@example.com',
  subject: 'Reset your password',
  html: '<p>Click here</p>',
  text: 'Click here',
};

describe('SmtpEmailProvider', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('configures the transport from the given SMTP settings', () => {
    new SmtpEmailProvider(CONFIG);
    expect(createTransport).toHaveBeenCalledWith({
      host: CONFIG.host,
      port: CONFIG.port,
      secure: false,
      auth: { user: CONFIG.user, pass: CONFIG.password },
    });
  });

  it('uses implicit TLS (secure:true) for port 465', () => {
    new SmtpEmailProvider({ ...CONFIG, port: 465 });
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ secure: true }));
  });

  it('sends the message with the configured from address', async () => {
    sendMail.mockResolvedValue({ messageId: 'abc123', rejected: [] });
    const provider = new SmtpEmailProvider(CONFIG);
    const result = await provider.send(MESSAGE);

    expect(sendMail).toHaveBeenCalledWith({
      from: CONFIG.from,
      to: MESSAGE.to,
      subject: MESSAGE.subject,
      html: MESSAGE.html,
      text: MESSAGE.text,
    });
    expect(result).toEqual({ providerMessageId: 'abc123', accepted: true });
    expect(logSpy).toHaveBeenCalled();
  });

  it('reports accepted:false when the recipient was rejected', async () => {
    sendMail.mockResolvedValue({ messageId: 'abc123', rejected: [MESSAGE.to] });
    const provider = new SmtpEmailProvider(CONFIG);
    const result = await provider.send(MESSAGE);
    expect(result.accepted).toBe(false);
  });

  it('logs and rethrows when the SMTP send fails', async () => {
    sendMail.mockRejectedValue(new Error('connection refused'));
    const provider = new SmtpEmailProvider(CONFIG);
    await expect(provider.send(MESSAGE)).rejects.toThrow('connection refused');
    expect(errorSpy).toHaveBeenCalled();
  });
});
