/**
 * CPB (Counsellors & Psychologists Board) license verification (SDLC §8.3).
 *
 * Production calls the CPB portal API to confirm a therapist's registration is
 * valid and current. Until those credentials exist, the mock validates the
 * documented license format (CPB/YYYY/NNNN) and echoes a plausible result, so
 * the onboarding workflow is fully exercisable.
 */

export interface CpbVerificationRequest {
  licenseNumber: string;
  holderName: string;
}

export interface CpbVerificationResult {
  valid: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'NOT_FOUND' | 'SUSPENDED';
  licenseNumber: string;
  holderName?: string;
  expiry?: string; // ISO date
  checkedAt: string;
  source: 'mock' | 'cpb-portal';
}

export interface CpbVerificationProvider {
  verify(request: CpbVerificationRequest): Promise<CpbVerificationResult>;
}

export const CPB_VERIFICATION_PROVIDER = Symbol('CPB_VERIFICATION_PROVIDER');

const CPB_LICENSE_PATTERN = /^CPB\/\d{4}\/\d{3,5}$/i;

export class MockCpbVerificationProvider implements CpbVerificationProvider {
  async verify(request: CpbVerificationRequest): Promise<CpbVerificationResult> {
    const checkedAt = new Date().toISOString();
    const normalized = request.licenseNumber.trim().toUpperCase();

    if (!CPB_LICENSE_PATTERN.test(normalized)) {
      return {
        valid: false,
        status: 'NOT_FOUND',
        licenseNumber: normalized,
        checkedAt,
        source: 'mock',
      };
    }

    // Deterministic mock: licenses ending in an even digit are ACTIVE.
    const lastDigit = Number(normalized.slice(-1));
    const active = Number.isFinite(lastDigit) ? lastDigit % 2 === 0 : true;
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + (active ? 2 : -1));

    return {
      valid: active,
      status: active ? 'ACTIVE' : 'EXPIRED',
      licenseNumber: normalized,
      holderName: request.holderName,
      expiry: expiry.toISOString().slice(0, 10),
      checkedAt,
      source: 'mock',
    };
  }
}
