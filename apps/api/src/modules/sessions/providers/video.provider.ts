import { Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

/**
 * Video session provider (SDLC §3.3, §7.4) — Daily.co (HIPAA-eligible) in
 * production. The backend creates a room per appointment and issues short-lived,
 * meeting-scoped tokens bound to a specific user, so unauthorized joins are
 * impossible. The mock returns plausible room URLs/tokens so the consult-room
 * flow works without Daily credentials (VIDEO_MODE=mock).
 */

export interface VideoRoom {
  roomName: string;
  roomUrl: string;
}

export interface VideoToken {
  token: string;
  expiresAt: string; // ISO
}

export interface CreateTokenOptions {
  roomName: string;
  userId: string;
  userName: string;
  isOwner: boolean;
  ttlSeconds: number;
}

export interface VideoProvider {
  readonly mode: 'mock' | 'live';
  createRoom(opts: { appointmentId: string }): Promise<VideoRoom>;
  createToken(opts: CreateTokenOptions): Promise<VideoToken>;
}

export const VIDEO_PROVIDER = Symbol('VIDEO_PROVIDER');

export class MockVideoProvider implements VideoProvider {
  readonly mode = 'mock' as const;
  private readonly logger = new Logger('MockVideo');

  async createRoom(opts: { appointmentId: string }): Promise<VideoRoom> {
    const roomName = `suluhu-${opts.appointmentId.slice(0, 8)}-${randomBytes(4).toString('hex')}`;
    this.logger.log(`Created video room ${roomName}`);
    return { roomName, roomUrl: `https://mock.daily.co/${roomName}` };
  }

  async createToken(opts: CreateTokenOptions): Promise<VideoToken> {
    const expiresAt = new Date(Date.now() + opts.ttlSeconds * 1000).toISOString();
    // Mock token encodes the binding (room + user + role + exp) like a real JWT would.
    const payload = Buffer.from(
      JSON.stringify({
        r: opts.roomName,
        u: opts.userId,
        o: opts.isOwner,
        exp: Math.floor(Date.parse(expiresAt) / 1000),
      }),
    ).toString('base64url');
    return { token: `mockvt.${payload}`, expiresAt };
  }
}
