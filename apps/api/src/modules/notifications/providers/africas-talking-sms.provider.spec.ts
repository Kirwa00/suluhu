import { Logger } from '@nestjs/common';
import { AfricasTalkingSmsProvider } from './africas-talking-sms.provider';

const MESSAGE = { to: '+254712345678', body: 'Your Suluhu code to sign in is 123456.' };

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

describe('AfricasTalkingSmsProvider', () => {
  let fetchMock: jest.Mock;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('uses the sandbox host for the sandbox username', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        SMSMessageData: {
          Message: 'Sent',
          Recipients: [{ number: MESSAGE.to, status: 'Success', statusCode: 101, messageId: 'm1' }],
        },
      }),
    );
    const provider = new AfricasTalkingSmsProvider({ username: 'sandbox', apiKey: 'k' });
    await provider.send(MESSAGE);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.sandbox.africastalking.com/version1/messaging',
    );
  });

  it('uses the production host for a real username', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        SMSMessageData: {
          Message: 'Sent',
          Recipients: [{ number: MESSAGE.to, status: 'Success', statusCode: 101, messageId: 'm1' }],
        },
      }),
    );
    const provider = new AfricasTalkingSmsProvider({ username: 'suluhu-prod', apiKey: 'k' });
    await provider.send(MESSAGE);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.africastalking.com/version1/messaging');
  });

  it('sends the apiKey header and form-encoded body, including the sender id when set', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        SMSMessageData: {
          Message: 'Sent',
          Recipients: [{ number: MESSAGE.to, status: 'Success', statusCode: 101, messageId: 'm1' }],
        },
      }),
    );
    const provider = new AfricasTalkingSmsProvider({
      username: 'suluhu-prod',
      apiKey: 'secret-key',
      senderId: 'SULUHU',
    });
    await provider.send(MESSAGE);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.apiKey).toBe('secret-key');
    const body = new URLSearchParams(init.body as string);
    expect(body.get('username')).toBe('suluhu-prod');
    expect(body.get('to')).toBe(MESSAGE.to);
    expect(body.get('message')).toBe(MESSAGE.body);
    expect(body.get('from')).toBe('SULUHU');
  });

  it('returns accepted:true with the message id on a successful send', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        SMSMessageData: {
          Message: 'Sent',
          Recipients: [
            { number: MESSAGE.to, status: 'Success', statusCode: 101, messageId: 'msg-42' },
          ],
        },
      }),
    );
    const provider = new AfricasTalkingSmsProvider({ username: 'sandbox', apiKey: 'k' });
    const result = await provider.send(MESSAGE);
    expect(result).toEqual({ providerMessageId: 'msg-42', accepted: true });
    expect(logSpy).toHaveBeenCalled();
  });

  it("returns accepted:false (without throwing) when Africa's Talking rejects the recipient", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        SMSMessageData: {
          Message: 'Sent',
          Recipients: [
            { number: MESSAGE.to, status: 'InvalidPhoneNumber', statusCode: 401, messageId: '' },
          ],
        },
      }),
    );
    const provider = new AfricasTalkingSmsProvider({ username: 'sandbox', apiKey: 'k' });
    const result = await provider.send(MESSAGE);
    expect(result.accepted).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('throws when the HTTP call itself fails', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Invalid apiKey' }, false, 401));
    const provider = new AfricasTalkingSmsProvider({ username: 'sandbox', apiKey: 'bad' });
    await expect(provider.send(MESSAGE)).rejects.toThrow(
      "Africa's Talking SMS send failed with status 401",
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('throws on a non-JSON response', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('not json') });
    const provider = new AfricasTalkingSmsProvider({ username: 'sandbox', apiKey: 'k' });
    await expect(provider.send(MESSAGE)).rejects.toThrow('unparseable response');
  });

  it('throws when the response has no recipient entry', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ SMSMessageData: { Message: 'Sent', Recipients: [] } }),
    );
    const provider = new AfricasTalkingSmsProvider({ username: 'sandbox', apiKey: 'k' });
    await expect(provider.send(MESSAGE)).rejects.toThrow('no recipient status');
  });
});
