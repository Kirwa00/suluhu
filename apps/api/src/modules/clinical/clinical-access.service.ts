import { Injectable } from '@nestjs/common';
import { UserRole, type AuthUser } from '@suluhu/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException } from '../../common/exceptions/app.exception';

/**
 * Attribute-based access control for clinical records (SDLC §7.2).
 * A therapist may access a patient's clinical data only if there is an
 * appointment between them. Patients access their own record; admins may view
 * for compliance (every access is audited by the caller).
 */
@Injectable()
export class ClinicalAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async therapistTreats(therapistUserId: string, patientUserId: string): Promise<boolean> {
    const count = await this.prisma.appointment.count({
      where: { therapistId: therapistUserId, patientId: patientUserId },
    });
    return count > 0;
  }

  async assertCanViewPatient(requester: AuthUser, patientId: string): Promise<void> {
    if (requester.role === UserRole.PATIENT) {
      if (requester.id !== patientId) throw AppException.forbidden();
      return;
    }
    if (requester.role === UserRole.THERAPIST) {
      if (!(await this.therapistTreats(requester.id, patientId))) throw AppException.forbidden();
      return;
    }
    if (requester.role === UserRole.ADMIN || requester.role === UserRole.SUPER_ADMIN) return;
    throw AppException.forbidden();
  }

  /** Returns the appointment if owned by the therapist, else throws. */
  async assertTherapistOwnsAppointment(therapistUserId: string, appointmentId: string) {
    const appt = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt) throw AppException.notFound('Appointment not found');
    if (appt.therapistId !== therapistUserId) {
      throw AppException.forbidden('You are not the therapist for this appointment');
    }
    return appt;
  }
}
