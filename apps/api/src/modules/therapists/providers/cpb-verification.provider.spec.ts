import { MockCpbVerificationProvider } from './cpb-verification.provider';

describe('MockCpbVerificationProvider', () => {
  const provider = new MockCpbVerificationProvider();

  it('rejects a malformed license number', async () => {
    const res = await provider.verify({ licenseNumber: 'not-a-license', holderName: 'A B' });
    expect(res.valid).toBe(false);
    expect(res.status).toBe('NOT_FOUND');
  });

  it('marks a well-formed even-ending license ACTIVE', async () => {
    const res = await provider.verify({ licenseNumber: 'CPB/2024/0002', holderName: 'A B' });
    expect(res.valid).toBe(true);
    expect(res.status).toBe('ACTIVE');
    expect(res.expiry).toBeDefined();
  });

  it('marks a well-formed odd-ending license EXPIRED', async () => {
    const res = await provider.verify({ licenseNumber: 'CPB/2024/0001', holderName: 'A B' });
    expect(res.valid).toBe(false);
    expect(res.status).toBe('EXPIRED');
  });
});
