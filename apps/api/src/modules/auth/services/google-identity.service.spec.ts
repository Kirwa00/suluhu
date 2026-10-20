import type { AppConfigService } from '../../../config/app-config.service';
import { GoogleIdentityService } from './google-identity.service';

const verifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken })),
}));

function makeService(clientId = 'client-id.apps.googleusercontent.com') {
  return new GoogleIdentityService({ google: { clientId } } as unknown as AppConfigService);
}

function ticket(payload: Record<string, unknown> | undefined) {
  return { getPayload: () => payload };
}

describe('GoogleIdentityService', () => {
  beforeEach(() => verifyIdToken.mockReset());

  it('returns the verified identity and checks the audience', async () => {
    verifyIdToken.mockResolvedValue(
      ticket({
        sub: 'g-123',
        email: 'Asha@Example.com',
        email_verified: true,
        given_name: 'Asha',
        family_name: 'Wanjiru',
      }),
    );
    await expect(makeService().verify('id-token')).resolves.toEqual({
      sub: 'g-123',
      email: 'asha@example.com',
      firstName: 'Asha',
      lastName: 'Wanjiru',
    });
    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'id-token',
      audience: 'client-id.apps.googleusercontent.com',
    });
  });

  it('rejects when Google login is not configured', async () => {
    await expect(makeService('').verify('id-token')).rejects.toThrow('not enabled');
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects an invalid token', async () => {
    verifyIdToken.mockRejectedValue(new Error('Wrong recipient'));
    await expect(makeService().verify('bad')).rejects.toThrow('Google sign-in failed');
  });

  it('rejects an unverified email', async () => {
    verifyIdToken.mockResolvedValue(
      ticket({ sub: 'g-1', email: 'a@example.com', email_verified: false }),
    );
    await expect(makeService().verify('id-token')).rejects.toThrow('Google sign-in failed');
  });
});
