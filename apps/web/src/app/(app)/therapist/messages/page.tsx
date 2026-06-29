'use client';

import { Suspense } from 'react';
import { MessagesView } from '@/components/app/messages-view';

export default function TherapistMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesView />
    </Suspense>
  );
}
