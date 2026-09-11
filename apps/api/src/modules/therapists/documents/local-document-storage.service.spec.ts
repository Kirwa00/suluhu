import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AppConfigService } from '../../../config/app-config.service';
import { LocalDocumentStorageService } from './local-document-storage.service';

async function makeService() {
  const dir = await mkdtemp(join(tmpdir(), 'suluhu-docs-'));
  const config = { documentStorage: { dir } } as unknown as AppConfigService;
  return { service: new LocalDocumentStorageService(config), dir };
}

describe('LocalDocumentStorageService', () => {
  let dirs: string[] = [];
  afterEach(async () => {
    await Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true })));
    dirs = [];
  });

  it('saves a file and reads back identical bytes', async () => {
    const { service, dir } = await makeService();
    dirs.push(dir);
    const buffer = Buffer.from('license-pdf-bytes');
    const { key } = await service.save(
      '11111111-1111-1111-1111-111111111111',
      'CPB License.pdf',
      buffer,
    );

    expect(key).toMatch(/^11111111-1111-1111-1111-111111111111\/[a-f0-9-]{36}-CPB_License\.pdf$/);
    await expect(service.read(key)).resolves.toEqual(buffer);
  });

  it('sanitizes a filename with path separators and unsafe characters', async () => {
    const { service, dir } = await makeService();
    dirs.push(dir);
    const { key } = await service.save(
      '11111111-1111-1111-1111-111111111111',
      '../../etc/passwd',
      Buffer.from('x'),
    );
    expect(key).not.toContain('..');
    expect(key.split('/')).toHaveLength(2);
  });

  it('rejects a read for a key that attempts path traversal', async () => {
    const { service, dir } = await makeService();
    dirs.push(dir);
    await expect(service.read('../outside/whatever')).rejects.toThrow('Invalid document reference');
    await expect(
      service.read('11111111-1111-1111-1111-111111111111/..%2f..%2fetc-passwd'),
    ).rejects.toThrow('Invalid document reference');
  });

  it('isolates documents under separate therapist ids', async () => {
    const { service, dir } = await makeService();
    dirs.push(dir);
    const idA = '22222222-2222-2222-2222-222222222222';
    const idB = '33333333-3333-3333-3333-333333333333';
    const a = await service.save(idA, 'id.pdf', Buffer.from('a'));
    const b = await service.save(idB, 'id.pdf', Buffer.from('b'));
    expect(a.key.startsWith(`${idA}/`)).toBe(true);
    expect(b.key.startsWith(`${idB}/`)).toBe(true);
    await expect(service.read(a.key)).resolves.toEqual(Buffer.from('a'));
    await expect(service.read(b.key)).resolves.toEqual(Buffer.from('b'));
  });

  it('deletes a stored file', async () => {
    const { service, dir } = await makeService();
    dirs.push(dir);
    const { key } = await service.save(
      '11111111-1111-1111-1111-111111111111',
      'cv.pdf',
      Buffer.from('x'),
    );
    await service.delete(key);
    await expect(service.read(key)).rejects.toThrow();
  });
});
