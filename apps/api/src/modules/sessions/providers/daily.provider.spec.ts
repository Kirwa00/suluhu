import { Logger } from '@nestjs/common';
import { DailyVideoProvider, normalizeDailyDomain } from './daily.provider';

const CONFIG = { apiKey: 'test-key', domain: 'suluhu' };

describe('normalizeDailyDomain', () => {
  it('appends daily.co to a bare subdomain', () => {
    expect(normalizeDailyDomain('suluhu')).toBe('suluhu.daily.co');
  });

  it('leaves a full domain unchanged', () => {
    expect(normalizeDailyDomain('suluhu.daily.co')).toBe('suluhu.daily.co');
  });

  it('strips a scheme, path and trailing whitespace', () => {
    expect(normalizeDailyDomain(' https://suluhu.daily.co/room-1 ')).toBe('suluhu.daily.co');
  });
});

describe('DailyVideoProvider', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('derives the join URL from the configured domain', () => {
    const provider = new DailyVideoProvider(CONFIG);
    expect(provider.roomUrl('suluhu-appt1-ab12')).toBe('https://suluhu.daily.co/suluhu-appt1-ab12');
    expect(provider.mode).toBe('live');
  });

  it('creates a private, expiring room named after the appointment', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          name: 'suluhu-appt1-ab12',
          url: 'https://suluhu.daily.co/suluhu-appt1-ab12',
        }),
    });

    const provider = new DailyVideoProvider(CONFIG);
    const room = await provider.createRoom({ appointmentId: 'appt1234-5678' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.daily.co/v1/rooms',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      }),
    );
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.name).toMatch(/^suluhu-appt1234-[0-9a-f]{8}$/);
    expect(body.privacy).toBe('private');
    expect(body.properties).toMatchObject({
      eject_at_room_exp: true,
      enable_recording: false,
      max_participants: 2,
    });
    expect(body.properties.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

    expect(room).toEqual({
      roomName: 'suluhu-appt1-ab12',
      roomUrl: 'https://suluhu.daily.co/suluhu-appt1-ab12',
    });
  });

  it('mints a meeting token bound to the room, user and role', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ token: 'daily-token-1' }),
    });

    const provider = new DailyVideoProvider({ ...CONFIG, baseUrl: 'https://api.example.com/v1' });
    const before = Date.now();
    const token = await provider.createToken({
      roomName: 'suluhu-appt1-ab12',
      userId: 'thr',
      userName: 'Daniel K',
      isOwner: true,
      ttlSeconds: 900,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/v1/meeting-tokens',
      expect.anything(),
    );
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.properties).toMatchObject({
      room_name: 'suluhu-appt1-ab12',
      user_id: 'thr',
      user_name: 'Daniel K',
      is_owner: true,
    });
    expect(body.properties.exp).toBeGreaterThanOrEqual(Math.floor(before / 1000) + 900);

    expect(token.token).toBe('daily-token-1');
    expect(Date.parse(token.expiresAt)).toBeGreaterThan(before);
  });

  it('throws with the status when Daily rejects the request', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: 'authentication-error' }),
    });
    const provider = new DailyVideoProvider(CONFIG);
    await expect(provider.createRoom({ appointmentId: 'appt1' })).rejects.toThrow(
      'Daily POST /rooms failed with status 401',
    );
  });

  it('throws when Daily returns a non-JSON body', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '<html>502</html>' });
    const provider = new DailyVideoProvider(CONFIG);
    await expect(provider.createRoom({ appointmentId: 'appt1' })).rejects.toThrow(
      'Daily POST /rooms returned an unparseable response',
    );
  });

  it('throws when the meeting-token response has no token', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({}) });
    const provider = new DailyVideoProvider(CONFIG);
    await expect(
      provider.createToken({
        roomName: 'r',
        userId: 'u',
        userName: 'U',
        isOwner: false,
        ttlSeconds: 60,
      }),
    ).rejects.toThrow('Daily meeting-token response missing a token');
  });
});
