import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@suluhu/shared';
import { OAuth2Client } from 'google-auth-library';
import { AppException } from '../../../common/exceptions/app.exception';
import { AppConfigService } from '../../../config/app-config.service';

export interface VerifiedGoogleIdentity {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** Verifies Google ID tokens (signature, issuer, expiry, audience = our client ID). */
@Injectable()
export class GoogleIdentityService {
  private readonly client = new OAuth2Client();

  constructor(private readonly config: AppConfigService) {}

  async verify(credential: string): Promise<VerifiedGoogleIdentity> {
    const { clientId } = this.config.google;
    if (!clientId) {
      throw AppException.badRequest('Google sign-in is not enabled', ErrorCode.AUTH_TOKEN_INVALID);
    }

    const invalid = () =>
      AppException.unauthorized('Google sign-in failed. Try again.', ErrorCode.AUTH_TOKEN_INVALID);

    let payload;
    try {
      const ticket = await this.client.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw invalid();
    }
    if (!payload?.sub || !payload.email || payload.email_verified !== true) throw invalid();

    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      firstName: payload.given_name ?? '',
      lastName: payload.family_name ?? '',
    };
  }
}
