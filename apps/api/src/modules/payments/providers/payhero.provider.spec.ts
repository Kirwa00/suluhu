import { Logger } from '@nestjs/common';
import type { StkPushRequest } from './mpesa.provider';
import { PayHeroProvider, parsePayHeroCallback, toLocalKenyanPhone } from './payhero.provider';

const REQUEST: StkPushRequest = {
  amountKsh: 2500,
  phone: '+254712345678',
  accountReference: 'APPT-1',
  description: 'Therapy session',
};

const CONFIG = {
  apiUsername: 'test-user',
  apiPassword: 'test-pass',
  channelId: 133,
  callbackUrl: 'https://api.example.com/api/v1/payments/payhero/callback',
};

describe('toLocalKenyanPhone', () => {
  it('converts E.164 (+254...) to local 0-prefixed format', () => {
    expect(toLocalKenyanPhone('+254712345678')).toBe('0712345678');
  });

  it('converts bare 254-prefixed digits to local format', () => {
    expect(toLocalKenyanPhone('254712345678')).toBe('0712345678');
  });

  it('leaves an already-local number unchanged', () => {
    expect(toLocalKenyanPhone('0712345678')).toBe('0712345678');
  });

  it('adds a leading 0 to a bare 9-digit subscriber number', () => {
    expect(toLocalKenyanPhone('712345678')).toBe('0712345678');
  });
});

describe('PayHeroProvider', () => {
  let log: jest.SpyInstance;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    log = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('POSTs the STK push with Basic auth and the expected body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ status: 'QUEUED', CheckoutRequestID: 'ws_CO_abc123' }),
    });

    const provider = new PayHeroProvider(CONFIG);
    const result = await provider.initiateStkPush(REQUEST);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.payhero.co.ke/api/v2/payments',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from('test-user:test-pass').toString('base64')}`,
          'Content-Type': 'application/json',
        }),
      }),
    );
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({
      amount: 2500,
      phone_number: '0712345678',
      channel_id: 133,
      provider: 'm-pesa',
      external_reference: 'APPT-1',
      callback_url: CONFIG.callbackUrl,
    });

    expect(result.checkoutRequestId).toBe('ws_CO_abc123');
    expect(result.customerMessage).toBe('Enter your M-Pesa PIN on your phone to complete payment.');
    expect(log).toHaveBeenCalled();
  });

  it('respects a custom baseUrl', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ CheckoutRequestID: 'ws_CO_1' }),
    });
    const provider = new PayHeroProvider({ ...CONFIG, baseUrl: 'https://sandbox.example.com' });
    await provider.initiateStkPush(REQUEST);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox.example.com/api/v2/payments',
      expect.anything(),
    );
  });

  it('throws with the response body when PayHero returns a non-2xx status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: 'Invalid credentials' }),
    });
    const provider = new PayHeroProvider(CONFIG);
    await expect(provider.initiateStkPush(REQUEST)).rejects.toThrow(
      'PayHero STK push failed with status 401',
    );
  });

  it('throws when the success response has no checkout id', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 201, text: async () => JSON.stringify({}) });
    const provider = new PayHeroProvider(CONFIG);
    await expect(provider.initiateStkPush(REQUEST)).rejects.toThrow(
      'PayHero STK push response missing a checkout id',
    );
  });
});

describe('parsePayHeroCallback', () => {
  it('parses a successful callback nested under `response` (PascalCase Daraja fields)', () => {
    const result = parsePayHeroCallback({
      response: {
        Amount: 2500,
        CheckoutRequestID: 'ws_CO_abc123',
        MpesaReceiptNumber: 'NLJ7RT61SV',
        Phone: '254712345678',
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
      },
    });
    expect(result).toEqual({
      checkoutRequestId: 'ws_CO_abc123',
      success: true,
      receipt: 'NLJ7RT61SV',
      resultDesc: 'The service request is processed successfully.',
    });
  });

  it('parses a failed callback (non-zero ResultCode)', () => {
    const result = parsePayHeroCallback({
      response: {
        CheckoutRequestID: 'ws_CO_abc123',
        ResultCode: 1032,
        ResultDesc: 'Request cancelled by user.',
      },
    });
    expect(result?.success).toBe(false);
    expect(result?.checkoutRequestId).toBe('ws_CO_abc123');
  });

  it('parses a flattened (non-nested) shape', () => {
    const result = parsePayHeroCallback({
      checkout_request_id: 'ws_CO_xyz',
      status: 'Success',
      mpesa_receipt_number: 'ABC123',
    });
    expect(result).toEqual({
      checkoutRequestId: 'ws_CO_xyz',
      success: true,
      receipt: 'ABC123',
      resultDesc: 'Success',
    });
  });

  it('returns null for a payload with no recognizable checkout id', () => {
    expect(parsePayHeroCallback({ foo: 'bar' })).toBeNull();
  });

  it('returns null for non-object bodies', () => {
    expect(parsePayHeroCallback(null)).toBeNull();
    expect(parsePayHeroCallback('a string')).toBeNull();
  });
});
