import type { AppConfigService } from '../../../config/app-config.service';
import { PasswordService } from './password.service';

const service = new PasswordService({
  security: { saltRounds: 4 },
} as unknown as AppConfigService);

describe('PasswordService', () => {
  it('hashes with bcrypt at the configured cost and never stores the plaintext', async () => {
    const hash = await service.hash('Nairobi#2024');
    expect(hash).toMatch(/^\$2[aby]\$04\$/);
    expect(hash).not.toContain('Nairobi#2024');
  });

  it('salts each hash so identical passwords differ at rest', async () => {
    const [first, second] = await Promise.all([
      service.hash('Nairobi#2024'),
      service.hash('Nairobi#2024'),
    ]);
    expect(first).not.toBe(second);
    await expect(service.compare('Nairobi#2024', second)).resolves.toBe(true);
  });

  it('accepts the correct password and rejects a wrong one', async () => {
    const hash = await service.hash('Nairobi#2024');
    await expect(service.compare('Nairobi#2024', hash)).resolves.toBe(true);
    await expect(service.compare('nairobi#2024', hash)).resolves.toBe(false);
  });
});
