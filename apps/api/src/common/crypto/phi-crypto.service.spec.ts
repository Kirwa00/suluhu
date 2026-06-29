import { PhiCryptoService } from './phi-crypto.service';
import type { AppConfigService } from '../../config/app-config.service';

function makeService(): PhiCryptoService {
  const key = Buffer.alloc(32, 7); // deterministic 32-byte test key
  const config = { security: { phiEncryptionKey: key } } as unknown as AppConfigService;
  return new PhiCryptoService(config);
}

describe('PhiCryptoService', () => {
  const service = makeService();

  it('round-trips plaintext through AES-256-GCM', () => {
    const plaintext = '1995-04-12'; // e.g. a date of birth (PHI)
    const ciphertext = service.encrypt(plaintext);
    expect(ciphertext).toMatch(/^v1\./);
    expect(ciphertext).not.toContain(plaintext);
    expect(service.decrypt(ciphertext)).toBe(plaintext);
  });

  it('produces distinct ciphertext for identical plaintext (random IV)', () => {
    const a = service.encrypt('same');
    const b = service.encrypt('same');
    expect(a).not.toBe(b);
    expect(service.decrypt(a)).toBe('same');
    expect(service.decrypt(b)).toBe('same');
  });

  it('rejects tampered ciphertext', () => {
    const ciphertext = service.encrypt('secret');
    const parts = ciphertext.split('.');
    const tampered = `${parts[0]}.${parts[1]}.${parts[2]}.${Buffer.from('evil').toString('base64')}`;
    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('computes a stable, case-insensitive blind index', () => {
    expect(service.blindIndex(' Test@Example.com ')).toBe(service.blindIndex('test@example.com'));
  });
});
