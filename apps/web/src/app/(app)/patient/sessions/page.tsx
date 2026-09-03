'use client';

import { AppointmentsPanel } from '@/components/app/appointments-panel';
import { PageHeading } from '@/components/app/stat-card';
import { useT } from '@/i18n/locale-context';

export default function PatientSessionsPage() {
  const t = useT();
  return (
    <div>
      <PageHeading title={t('nav.sessions')} subtitle={t('sessions.patient.subtitle')} />
      <AppointmentsPanel viewer="patient" />
    </div>
  );
}
