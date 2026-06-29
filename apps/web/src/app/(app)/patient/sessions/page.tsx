'use client';

import { AppointmentsPanel } from '@/components/app/appointments-panel';
import { PageHeading } from '@/components/app/stat-card';

export default function PatientSessionsPage() {
  return (
    <div>
      <PageHeading title="My sessions" subtitle="Your upcoming and past therapy sessions." />
      <AppointmentsPanel viewer="patient" />
    </div>
  );
}
