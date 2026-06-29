/**
 * Domain enumerations shared by the API and web app.
 *
 * These are plain string-literal unions plus runtime arrays. The Prisma schema
 * mirrors these as native PG enums; keeping a single source here keeps the
 * contract identical on both sides of the wire.
 */

export const UserRole = {
  PATIENT: 'PATIENT',
  THERAPIST: 'THERAPIST',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const USER_ROLES = Object.values(UserRole);

/** Roles for whom MFA is mandatory (SDLC §7.2). */
export const MFA_REQUIRED_ROLES: readonly UserRole[] = [
  UserRole.THERAPIST,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

export const UserStatus = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const Locale = {
  EN: 'en',
  SW: 'sw',
} as const;
export type Locale = (typeof Locale)[keyof typeof Locale];
export const LOCALES = Object.values(Locale);

export const Gender = {
  FEMALE: 'FEMALE',
  MALE: 'MALE',
  NON_BINARY: 'NON_BINARY',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const TherapistVerificationStatus = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type TherapistVerificationStatus =
  (typeof TherapistVerificationStatus)[keyof typeof TherapistVerificationStatus];

export const AppointmentStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const PaymentMethod = {
  MPESA: 'MPESA',
  AIRTEL: 'AIRTEL',
  CARD: 'CARD',
  INSURANCE: 'INSURANCE',
  FREE_SESSION: 'FREE_SESSION',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const AssessmentType = {
  PHQ9: 'PHQ9',
  GAD7: 'GAD7',
  CAGE: 'CAGE',
} as const;
export type AssessmentType = (typeof AssessmentType)[keyof typeof AssessmentType];

/** Risk stratification levels (SDLC §12.1). */
export const RiskLevel = {
  MINIMAL: 'MINIMAL',
  MILD: 'MILD',
  MODERATE: 'MODERATE',
  MODERATELY_SEVERE: 'MODERATELY_SEVERE',
  SEVERE: 'SEVERE',
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const NotificationChannel = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP',
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

/** OTP / verification purposes. */
export const VerificationPurpose = {
  PHONE_VERIFICATION: 'PHONE_VERIFICATION',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  MFA_CHALLENGE: 'MFA_CHALLENGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;
export type VerificationPurpose = (typeof VerificationPurpose)[keyof typeof VerificationPurpose];

/** Specialties used for therapist discovery filtering. */
export const TherapySpecialty = {
  DEPRESSION: 'DEPRESSION',
  ANXIETY: 'ANXIETY',
  TRAUMA_PTSD: 'TRAUMA_PTSD',
  RELATIONSHIPS: 'RELATIONSHIPS',
  FAMILY: 'FAMILY',
  ADDICTION: 'ADDICTION',
  GRIEF: 'GRIEF',
  YOUTH_ADOLESCENT: 'YOUTH_ADOLESCENT',
  STRESS_BURNOUT: 'STRESS_BURNOUT',
  GENERAL_COUNSELLING: 'GENERAL_COUNSELLING',
} as const;
export type TherapySpecialty = (typeof TherapySpecialty)[keyof typeof TherapySpecialty];
export const THERAPY_SPECIALTIES = Object.values(TherapySpecialty);
