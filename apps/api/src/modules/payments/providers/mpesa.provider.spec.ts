import { Logger } from '@nestjs/common';
import { MockMpesaProvider, type StkPushRequest } from './mpesa.provider';

const REQUEST: StkPushRequest = {
  amountKsh: 2500,
  phone: '+254712345678',
  accountReference: 'APPT-1',
  description: 'Therapy session',
};

describe('MockMpesaProvider', () => {
  let log: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('returns a pending STK push with correlation ids and a customer prompt', async () => {
    const provider = new MockMpesaProvider();
    const result = await provider.initiateStkPush(REQUEST);

    expect(provider.mode).toBe('mock');
    expect(result.checkoutRequestId).toMatch(/^ws_CO_/);
    expect(result.merchantRequestId).toHaveLength(36);
    expect(result.customerMessage).toBe('Enter your M-Pesa PIN on your phone to complete payment.');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('KES 2500'));
  });

  it('issues a distinct checkout id per push', async () => {
    const provider = new MockMpesaProvider();
    const first = await provider.initiateStkPush(REQUEST);
    const second = await provider.initiateStkPush(REQUEST);
    expect(first.checkoutRequestId).not.toBe(second.checkoutRequestId);
  });

  it('confirms the push via the registered handler after the simulated delay', async () => {
    const provider = new MockMpesaProvider();
    const confirm = jest.fn().mockResolvedValue(undefined);
    provider.registerConfirmHandler(confirm);

    const { checkoutRequestId } = await provider.initiateStkPush(REQUEST);
    expect(confirm).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);
    expect(confirm).toHaveBeenCalledWith({
      checkoutRequestId,
      success: true,
      receipt: expect.stringMatching(/^MOCK\d{8}$/),
    });
  });

  it('does not throw when no confirm handler is registered', async () => {
    const provider = new MockMpesaProvider();
    await provider.initiateStkPush(REQUEST);
    expect(() => jest.advanceTimersByTime(2000)).not.toThrow();
  });
});
