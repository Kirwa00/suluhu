import { UserRole } from '@suluhu/shared';
import type { AuthUser } from '@suluhu/shared';
import type { PrismaService } from '../../../prisma/prisma.service';
import type { AuditService } from '../../audit/audit.service';
import type { LocalDocumentStorageService } from './local-document-storage.service';
import { TherapistDocumentsService } from './therapist-documents.service';

const THERAPIST: AuthUser = {
  id: 'user-therapist-1',
  email: 't@x',
  role: UserRole.THERAPIST,
  status: 'ACTIVE',
  mfaEnabled: false,
};
const OTHER_THERAPIST: AuthUser = { ...THERAPIST, id: 'user-therapist-2' };
const ADMIN: AuthUser = {
  id: 'user-admin-1',
  email: 'a@x',
  role: UserRole.ADMIN,
  status: 'ACTIVE',
  mfaEnabled: true,
};

function makeService() {
  const documents = new Map<string, Record<string, unknown>>();
  const prisma = {
    therapistProfile: {
      findUnique: jest.fn(({ where }: { where: { userId: string } }) =>
        where.userId === THERAPIST.id ? { id: 'profile-1', userId: THERAPIST.id } : null,
      ),
    },
    therapistDocument: {
      create: jest.fn(({ data }: { data: Record<string, unknown> }) => {
        const doc = { id: 'doc-1', uploadedAt: new Date(), ...data };
        documents.set(doc.id, doc);
        return doc;
      }),
      findMany: jest.fn(({ where }: { where: { therapistId: string } }) =>
        [...documents.values()].filter((d) => d.therapistId === where.therapistId),
      ),
      findUnique: jest.fn(({ where }: { where: { id: string } }) => {
        const doc = documents.get(where.id);
        if (!doc) return null;
        return { ...doc, therapist: { userId: THERAPIST.id } };
      }),
    },
  } as unknown as PrismaService;

  const storage = {
    save: jest.fn().mockResolvedValue({ key: 'profile-1/uuid-cv.pdf' }),
    read: jest.fn().mockResolvedValue(Buffer.from('file-bytes')),
  } as unknown as LocalDocumentStorageService;

  const audit = { record: jest.fn() } as unknown as AuditService;

  return { service: new TherapistDocumentsService(prisma, storage, audit), prisma, storage, audit };
}

describe('TherapistDocumentsService', () => {
  it('uploads a document, storing it and recording an audit entry', async () => {
    const { service, storage, audit } = makeService();
    const view = await service.upload(
      THERAPIST.id,
      'CV' as never,
      { originalname: 'cv.pdf', buffer: Buffer.from('x') },
      {},
    );

    expect(storage.save).toHaveBeenCalledWith('profile-1', 'cv.pdf', Buffer.from('x'));
    expect(view.originalName).toBe('cv.pdf');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'therapist_document.upload', userId: THERAPIST.id }),
    );
  });

  it('throws when uploading for a user with no therapist profile', async () => {
    const { service } = makeService();
    await expect(
      service.upload(
        'no-profile',
        'CV' as never,
        { originalname: 'x.pdf', buffer: Buffer.from('x') },
        {},
      ),
    ).rejects.toThrow('Therapist profile not found');
  });

  it("lists only the requesting therapist's own documents", async () => {
    const { service } = makeService();
    await service.upload(
      THERAPIST.id,
      'CV' as never,
      { originalname: 'cv.pdf', buffer: Buffer.from('x') },
      {},
    );
    const list = await service.listMine(THERAPIST.id);
    expect(list).toHaveLength(1);
    expect(list[0]?.originalName).toBe('cv.pdf');
  });

  it('lets the owning therapist download their own document', async () => {
    const { service } = makeService();
    await service.upload(
      THERAPIST.id,
      'CV' as never,
      { originalname: 'cv.pdf', buffer: Buffer.from('x') },
      {},
    );
    const result = await service.download('doc-1', THERAPIST, {});
    expect(result.buffer).toEqual(Buffer.from('file-bytes'));
    expect(result.filename).toBe('cv.pdf');
  });

  it("lets an admin download any therapist's document", async () => {
    const { service } = makeService();
    await service.upload(
      THERAPIST.id,
      'CV' as never,
      { originalname: 'cv.pdf', buffer: Buffer.from('x') },
      {},
    );
    await expect(service.download('doc-1', ADMIN, {})).resolves.toBeDefined();
  });

  it("forbids a different therapist from downloading someone else's document", async () => {
    const { service } = makeService();
    await service.upload(
      THERAPIST.id,
      'CV' as never,
      { originalname: 'cv.pdf', buffer: Buffer.from('x') },
      {},
    );
    await expect(service.download('doc-1', OTHER_THERAPIST, {})).rejects.toThrow();
  });

  it('404s downloading a document that does not exist', async () => {
    const { service } = makeService();
    await expect(service.download('missing', ADMIN, {})).rejects.toThrow('Document not found');
  });
});
