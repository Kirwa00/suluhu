'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppointmentsPanel } from '@/components/app/appointments-panel';
import { PageHeading } from '@/components/app/stat-card';
import { ApiClientError } from '@/lib/api-client';
import { therapistsApi } from '@/lib/api/therapists-api';
import { dayName } from '@/lib/format';

interface DayRow {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun

function emptyRows(): DayRow[] {
  return ORDER.map((d) => ({ dayOfWeek: d, enabled: false, startTime: '09:00', endTime: '17:00' }));
}

export default function TherapistSchedulePage() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DayRow[]>(emptyRows());
  const [error, setError] = useState<string | null>(null);

  const { data: existing } = useQuery({
    queryKey: ['availability'],
    queryFn: () => therapistsApi.getAvailability(),
  });

  useEffect(() => {
    if (!existing) return;
    setRows(
      ORDER.map((d) => {
        const found = existing.find((s) => s.dayOfWeek === d && s.isAvailable);
        return found
          ? { dayOfWeek: d, enabled: true, startTime: found.startTime, endTime: found.endTime }
          : { dayOfWeek: d, enabled: false, startTime: '09:00', endTime: '17:00' };
      }),
    );
  }, [existing]);

  const save = useMutation({
    mutationFn: () =>
      therapistsApi.setAvailability({
        slots: rows
          .filter((r) => r.enabled)
          .map((r) => ({
            dayOfWeek: r.dayOfWeek,
            startTime: r.startTime,
            endTime: r.endTime,
            isAvailable: true,
          })),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availability'] }),
    onError: (err) =>
      setError(err instanceof ApiClientError ? err.message : 'Could not save availability.'),
  });

  const update = (dayOfWeek: number, patch: Partial<DayRow>) =>
    setRows((rs) => rs.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)));

  return (
    <div className="max-w-3xl">
      <PageHeading
        title="Schedule"
        subtitle="Set your weekly availability (EAT) and view upcoming sessions."
      />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Weekly availability</CardTitle>
          <CardDescription>
            Patients can book within these windows. Times are East Africa Time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <Alert variant="error">{error}</Alert>}
          {save.isSuccess && <Alert variant="success">Availability saved.</Alert>}

          {rows.map((r) => (
            <div
              key={r.dayOfWeek}
              className="flex flex-wrap items-center gap-3 border-b border-outline-variant py-2 last:border-0"
            >
              <label className="flex w-32 items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#1b4f8c]"
                  checked={r.enabled}
                  onChange={(e) => update(r.dayOfWeek, { enabled: e.target.checked })}
                />
                <span className="text-sm font-medium text-on-surface">{dayName(r.dayOfWeek)}</span>
              </label>
              <Input
                type="time"
                value={r.startTime}
                disabled={!r.enabled}
                onChange={(e) => update(r.dayOfWeek, { startTime: e.target.value })}
                className="w-32"
              />
              <span className="text-on-surface-variant">to</span>
              <Input
                type="time"
                value={r.endTime}
                disabled={!r.enabled}
                onChange={(e) => update(r.dayOfWeek, { endTime: e.target.value })}
                className="w-32"
              />
            </div>
          ))}

          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save availability'}
          </Button>
        </CardContent>
      </Card>

      <h2 className="mb-4 font-display text-xl font-semibold text-on-surface">Sessions</h2>
      <AppointmentsPanel viewer="therapist" />
    </div>
  );
}
