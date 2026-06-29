/** Small display helpers shared across the web app. */

export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function dayName(day: number): string {
  return DAY_NAMES[day] ?? `Day ${day}`;
}

export function formatKsh(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const EAT = 'Africa/Nairobi';

export function formatTimeEAT(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: EAT,
  });
}

export function formatDateTimeEAT(iso: string): string {
  return new Date(iso).toLocaleString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: EAT,
  });
}

/** Today in EAT as YYYY-MM-DD (for date inputs). */
export function todayEAT(): string {
  return new Date(new Date().getTime() + 3 * 3600_000).toISOString().slice(0, 10);
}

export function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
