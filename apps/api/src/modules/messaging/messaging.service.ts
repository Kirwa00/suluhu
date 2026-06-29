import { Injectable } from '@nestjs/common';
import { UserRole, type AuthUser } from '@suluhu/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { PhiCryptoService } from '../../common/crypto/phi-crypto.service';
import { AppException } from '../../common/exceptions/app.exception';
import { AuditService } from '../audit/audit.service';
import type { RequestContext } from '../auth/types';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly phi: PhiCryptoService,
    private readonly audit: AuditService,
  ) {}

  async listConversations(user: AuthUser) {
    const rows = await this.prisma.conversation.findMany({
      where: { OR: [{ patientId: user.id }, { therapistId: user.id }] },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        therapist: { select: { id: true, firstName: true, lastName: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const result = [];
    for (const c of rows) {
      const counterpart = c.patientId === user.id ? c.therapist : c.patient;
      const unread = await this.prisma.message.count({
        where: { conversationId: c.id, senderId: { not: user.id }, readAt: null },
      });
      const last = c.messages[0];
      result.push({
        id: c.id,
        counterpartName: `${counterpart.firstName} ${counterpart.lastName}`.trim(),
        counterpartId: counterpart.id,
        lastMessage: last ? this.phi.decrypt(last.bodyEnc).slice(0, 80) : null,
        lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
        unread,
      });
    }
    return result;
  }

  async getOrCreate(user: AuthUser, counterpartId: string, ctx: RequestContext) {
    const { patientId, therapistId } = await this.resolveParties(user, counterpartId);

    const hasRelationship =
      (await this.prisma.appointment.count({ where: { patientId, therapistId } })) > 0;
    if (!hasRelationship) {
      throw AppException.forbidden('You can only message a therapist you have booked with');
    }

    const conversation = await this.prisma.conversation.upsert({
      where: { patientId_therapistId: { patientId, therapistId } },
      create: { patientId, therapistId },
      update: {},
    });
    await this.audit.record({
      userId: user.id,
      action: 'conversation.open',
      resourceType: 'conversation',
      resourceId: conversation.id,
      ...ctx,
    });
    return { id: conversation.id };
  }

  async getMessages(user: AuthUser, conversationId: string) {
    const convo = await this.assertParty(user, conversationId);
    const counterpart = convo.patientId === user.id ? convo.therapist : convo.patient;

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    // Mark the counterpart's messages as read.
    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: user.id }, readAt: null },
      data: { readAt: new Date() },
    });

    return {
      conversationId,
      counterpartName: `${counterpart.firstName} ${counterpart.lastName}`.trim(),
      messages: messages.map((m) => ({
        id: m.id,
        mine: m.senderId === user.id,
        body: this.phi.decrypt(m.bodyEnc),
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt?.toISOString() ?? null,
      })),
    };
  }

  async send(user: AuthUser, conversationId: string, body: string, ctx: RequestContext) {
    await this.assertParty(user, conversationId);
    const message = await this.prisma.message.create({
      data: { conversationId, senderId: user.id, bodyEnc: this.phi.encrypt(body) },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    await this.audit.record({
      userId: user.id,
      action: 'message.send',
      resourceType: 'message',
      resourceId: message.id,
      phiAccessed: true,
      ...ctx,
    });
    return {
      id: message.id,
      mine: true,
      body,
      createdAt: message.createdAt.toISOString(),
      readAt: null,
    };
  }

  private async assertParty(user: AuthUser, conversationId: string) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        therapist: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!convo) throw AppException.notFound('Conversation not found');
    if (convo.patientId !== user.id && convo.therapistId !== user.id) throw AppException.forbidden();
    return convo;
  }

  private async resolveParties(user: AuthUser, counterpartId: string) {
    const counterpart = await this.prisma.user.findUnique({ where: { id: counterpartId } });
    if (!counterpart) throw AppException.notFound('User not found');

    if (user.role === UserRole.PATIENT && counterpart.role === UserRole.THERAPIST) {
      return { patientId: user.id, therapistId: counterpartId };
    }
    if (user.role === UserRole.THERAPIST && counterpart.role === UserRole.PATIENT) {
      return { patientId: counterpartId, therapistId: user.id };
    }
    throw AppException.badRequest('Messaging is between a patient and their therapist');
  }
}
