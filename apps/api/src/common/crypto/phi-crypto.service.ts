import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { AppConfigService } from '../../config/app-config.service';

/**
 * Application-layer encryption for PHI fields (SDLC §5.2, §7.3).
 *
 * AES-256-GCM with a per-record random IV. Ciphertext is serialized as
 * `v1.<iv>.<authTag>.<data>` (all base64). The master key comes from
 * PHI_ENCRYPTION_KEY; in production this is sourced from a KMS/secrets manager
 * and rotated. A versioned prefix allows future key rotation.
 */
@Injectable()
export class PhiCryptoService {
  private static readonly VERSION = 'v1';
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;

  private readonly key: Buffer;

  constructor(config: AppConfigService) {
    this.key = config.security.phiEncryptionKey;
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(PhiCryptoService.IV_LENGTH);
    const cipher = createCipheriv(PhiCryptoService.ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [
      PhiCryptoService.VERSION,
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split('.');
    if (parts.length !== 4 || parts[0] !== PhiCryptoService.VERSION) {
      throw new Error('Malformed or unsupported PHI ciphertext');
    }
    const [, ivB64, tagB64, dataB64] = parts as [string, string, string, string];
    const decipher = createDecipheriv(
      PhiCryptoService.ALGORITHM,
      this.key,
      Buffer.from(ivB64, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  /** Deterministic SHA-256 hash for blind-index lookups (non-reversible). */
  blindIndex(value: string): string {
    return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
  }

  /** Constant-time comparison to avoid timing attacks. */
  safeEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
