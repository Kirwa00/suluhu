/**
 * Database seed — idempotent. Creates a super-admin and (in non-production)
 * a few demo accounts so the platform is explorable immediately.
 *
 * Run: `npm run db:seed`
 */
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function upsertUser(input: {
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  return prisma.user.upsert({
    where: { email: input.email },
    update: {},
    create: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
      status: UserStatus.ACTIVE,
      firstName: input.firstName,
      lastName: input.lastName,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      acceptedTermsAt: new Date(),
      mfaEnabled: input.role !== UserRole.PATIENT,
    },
  });
}

async function main(): Promise<void> {
  const superAdmin = await upsertUser({
    email: 'founder@suluhu.co.ke',
    phone: '+254700000000',
    password: process.env.SEED_SUPERADMIN_PASSWORD ?? 'ChangeMe!2026',
    role: UserRole.SUPER_ADMIN,
    firstName: 'Emmanuel',
    lastName: 'Kirwa',
  });
  console.log(`Super admin ready: ${superAdmin.email}`);

  if (process.env.NODE_ENV !== 'production') {
    const admin = await upsertUser({
      email: 'admin@suluhu.co.ke',
      phone: '+254700000001',
      password: 'ChangeMe!2026',
      role: UserRole.ADMIN,
      firstName: 'Amina',
      lastName: 'Wanjiru',
    });

    const therapistUser = await upsertUser({
      email: 'therapist@suluhu.co.ke',
      phone: '+254700000002',
      password: 'ChangeMe!2026',
      role: UserRole.THERAPIST,
      firstName: 'Daniel',
      lastName: 'Kiptoo',
    });
    const therapistProfile = await prisma.therapistProfile.upsert({
      where: { userId: therapistUser.id },
      update: { verificationStatus: 'APPROVED' },
      create: {
        userId: therapistUser.id,
        cpbLicenseNumber: 'CPB/2024/0002',
        cpbExpiry: new Date('2027-12-31'),
        verificationStatus: 'APPROVED',
        title: 'Counselling Psychologist',
        gender: 'MALE',
        yearsExperience: 8,
        specialties: ['ANXIETY', 'DEPRESSION', 'TRAUMA_PTSD'],
        languages: ['English', 'Swahili'],
        bio: 'Licensed counselling psychologist based in Eldoret with eight years of experience supporting adults through anxiety, depression and trauma using evidence-based approaches.',
        sessionRateKsh: 2500,
      },
    });

    // Give the demo therapist Mon–Fri 09:00–17:00 (EAT) availability so the
    // booking flow has bookable slots out of the box.
    await prisma.therapistAvailability.deleteMany({
      where: { therapistId: therapistProfile.id },
    });
    await prisma.therapistAvailability.createMany({
      data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        therapistId: therapistProfile.id,
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      })),
    });

    const patientUser = await upsertUser({
      email: 'patient@suluhu.co.ke',
      phone: '+254700000003',
      password: 'ChangeMe!2026',
      role: UserRole.PATIENT,
      firstName: 'Faith',
      lastName: 'Chebet',
    });
    await prisma.patientProfile.upsert({
      where: { userId: patientUser.id },
      update: {},
      create: { userId: patientUser.id, county: 'Uasin Gishu' },
    });

    console.log(`Demo accounts ready: ${admin.email}, ${therapistUser.email}, ${patientUser.email}`);
  }

  // Psychoeducation library — published resources available to all patients.
  const resources = [
    {
      slug: 'understanding-anxiety',
      title: 'Understanding Anxiety',
      summary: 'What anxiety is, why it happens, and simple ways to ease it.',
      category: 'Anxiety',
      type: 'ARTICLE' as const,
      body: 'Anxiety is a natural response to stress. It becomes a concern when it is persistent and interferes with daily life. Common signs include restlessness, racing thoughts, and trouble sleeping.\n\nGrounding techniques, paced breathing, and talking to a therapist can all help. You are not alone, and support is available.',
    },
    {
      slug: 'box-breathing-exercise',
      title: 'Box Breathing (4-4-4-4)',
      summary: 'A 2-minute breathing exercise to calm your nervous system.',
      category: 'Coping Skills',
      type: 'EXERCISE' as const,
      body: 'Box breathing is a simple, powerful way to steady yourself.\n\n1. Breathe in through your nose for 4 seconds.\n2. Hold for 4 seconds.\n3. Breathe out for 4 seconds.\n4. Hold for 4 seconds.\n\nRepeat 4–6 times. Notice how your body softens with each round.',
    },
    {
      slug: 'sleep-and-mental-health',
      title: 'Sleep and Mental Health',
      summary: 'How rest affects your mood, and habits for better sleep.',
      category: 'Wellbeing',
      type: 'ARTICLE' as const,
      body: 'Sleep and mental health are deeply connected. Poor sleep can worsen low mood and anxiety, while good rest supports recovery.\n\nTry a consistent bedtime, limit screens before bed, and keep your room cool and dark. If sleep problems persist, mention them to your therapist.',
    },
  ];
  for (const r of resources) {
    await prisma.contentResource.upsert({
      where: { slug: r.slug },
      update: { published: true },
      create: { ...r, language: 'en', published: true },
    });
  }
  console.log(`Seeded ${resources.length} psychoeducation resources`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
