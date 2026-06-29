import { Injectable } from '@nestjs/common';
import type { MoodEntryInput } from '@suluhu/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { PhiCryptoService } from '../../common/crypto/phi-crypto.service';

@Injectable()
export class MoodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly phi: PhiCryptoService,
  ) {}

  async create(patientId: string, input: MoodEntryInput) {
    const entry = await this.prisma.moodEntry.create({
      data: {
        patientId,
        moodScore: input.moodScore,
        noteEnc: input.note?.trim() ? this.phi.encrypt(input.note.trim()) : null,
        tags: input.tags,
        loggedAt: input.loggedAt ? new Date(input.loggedAt) : new Date(),
      },
    });
    return this.toView(entry);
  }

  async list(patientId: string) {
    const entries = await this.prisma.moodEntry.findMany({
      where: { patientId },
      orderBy: { loggedAt: 'desc' },
      take: 60,
    });
    const trend = [...entries]
      .reverse()
      .map((e) => ({ date: e.loggedAt.toISOString(), score: e.moodScore }));
    const average =
      entries.length > 0
        ? Math.round((entries.reduce((s, e) => s + e.moodScore, 0) / entries.length) * 10) / 10
        : null;
    return { entries: entries.map((e) => this.toView(e)), trend, average };
  }

  private toView(entry: {
    id: string;
    moodScore: number;
    noteEnc: string | null;
    tags: string[];
    loggedAt: Date;
  }) {
    return {
      id: entry.id,
      moodScore: entry.moodScore,
      note: entry.noteEnc ? this.phi.decrypt(entry.noteEnc) : '',
      tags: entry.tags,
      loggedAt: entry.loggedAt.toISOString(),
    };
  }
}
