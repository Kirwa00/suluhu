import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { AppConfigService } from '../../../config/app-config.service';
import { AppException } from '../../../common/exceptions/app.exception';

/**
 * Stores therapist credential documents (CPB license, national ID,
 * certificates, CVs) on local disk under `DOCUMENT_STORAGE_DIR`. Small
 * deployments can run on this directly (mount a persistent volume in
 * production); larger ones can swap this class for an S3-backed
 * implementation behind the same interface without touching callers.
 */
export interface SavedDocument {
  /** Opaque key stored in TherapistDocument.url — never a directly-fetchable URL. */
  key: string;
}

const KEY_PATTERN = /^[a-f0-9-]{36}\/[a-f0-9-]{36}-[^/\\]{1,200}$/i;

@Injectable()
export class LocalDocumentStorageService {
  private readonly logger = new Logger('DocumentStorage');
  private readonly root: string;

  constructor(config: AppConfigService) {
    this.root = resolve(config.documentStorage.dir);
  }

  async save(therapistId: string, originalName: string, buffer: Buffer): Promise<SavedDocument> {
    const safeName = sanitizeFilename(originalName);
    const key = `${therapistId}/${randomUUID()}-${safeName}`;
    const path = this.resolveKey(key);
    await mkdir(resolve(this.root, therapistId), { recursive: true });
    await writeFile(path, buffer, { mode: 0o600 });
    this.logger.log(`Stored document ${key}`);
    return { key };
  }

  async read(key: string): Promise<Buffer> {
    const path = this.resolveKey(key);
    return readFile(path);
  }

  async delete(key: string): Promise<void> {
    const path = this.resolveKey(key);
    await unlink(path).catch(() => undefined);
  }

  /** Resolves a storage key to an absolute path, rejecting any traversal outside `root`. */
  private resolveKey(key: string): string {
    if (!KEY_PATTERN.test(key)) {
      throw AppException.badRequest('Invalid document reference');
    }
    const path = resolve(this.root, key);
    if (path !== this.root && !path.startsWith(this.root + sep)) {
      throw AppException.badRequest('Invalid document reference');
    }
    return path;
  }
}

function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'document';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-150);
  return cleaned || 'document';
}
