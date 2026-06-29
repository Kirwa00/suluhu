'use client';

import { useQuery } from '@tanstack/react-query';
import { Gender, THERAPY_SPECIALTIES, SPOKEN_LANGUAGES } from '@suluhu/shared';
import { Search, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageHeading } from '@/components/app/stat-card';
import { therapistsApi, type TherapistCard } from '@/lib/api/therapists-api';
import { formatKsh, humanizeEnum } from '@/lib/format';

interface Filters {
  q: string;
  specialty: string;
  language: string;
  gender: string;
  sort: string;
}

export default function TherapistDirectory() {
  const [filters, setFilters] = useState<Filters>({
    q: '',
    specialty: '',
    language: '',
    gender: '',
    sort: 'rating',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['therapists', filters],
    queryFn: () =>
      therapistsApi.search({
        q: filters.q || undefined,
        specialty: (filters.specialty || undefined) as never,
        language: filters.language || undefined,
        gender: (filters.gender || undefined) as never,
        sort: filters.sort as never,
        pageSize: 24,
      }),
  });

  const set = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <PageHeading
        title="Find a therapist"
        subtitle="Browse CPB-licensed therapists. Filter by specialty, language, and more."
      />

      <Card className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" aria-hidden />
            <Input
              className="pl-9"
              placeholder="Search by name or focus"
              value={filters.q}
              onChange={(ev) => set('q', ev.target.value)}
            />
          </div>
          <Select value={filters.specialty} onChange={(ev) => set('specialty', ev.target.value)} aria-label="Specialty">
            <option value="">All specialties</option>
            {THERAPY_SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {humanizeEnum(s)}
              </option>
            ))}
          </Select>
          <Select value={filters.language} onChange={(ev) => set('language', ev.target.value)} aria-label="Language">
            <option value="">All languages</option>
            {SPOKEN_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          <Select value={filters.sort} onChange={(ev) => set('sort', ev.target.value)} aria-label="Sort">
            <option value="rating">Top rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="experience">Most experienced</option>
          </Select>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:w-1/2">
          <Select value={filters.gender} onChange={(ev) => set('gender', ev.target.value)} aria-label="Gender">
            <option value="">Any gender</option>
            {Object.values(Gender).map((g) => (
              <option key={g} value={g}>
                {humanizeEnum(g)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-on-surface-variant">Loading therapists…</p>
      ) : !data || data.items.length === 0 ? (
        <Card className="p-10 text-center text-on-surface-variant">
          No therapists match your filters yet. Try widening your search.
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-on-surface-variant">
            {data.pagination.totalItems} therapist{data.pagination.totalItems === 1 ? '' : 's'} found
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((t) => (
              <TherapistResultCard key={t.id} t={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TherapistResultCard({ t }: { t: TherapistCard }) {
  return (
    <Link href={`/patient/therapists/${t.id}`}>
      <Card className="h-full p-5 transition-shadow hover:shadow-ambient">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-lg font-semibold text-on-primary">
            {t.firstName[0]}
            {t.lastName[0]}
          </span>
          <div>
            <p className="font-display font-semibold text-on-surface">
              {t.firstName} {t.lastName}
            </p>
            <p className="text-sm text-on-surface-variant">{t.title}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-accent px-2 py-0.5 text-xs text-secondary">
              {humanizeEnum(s)}
            </span>
          ))}
        </div>
        {t.bioSnippet && <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">{t.bioSnippet}</p>}
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-on-surface-variant">
            <Star className="h-4 w-4 fill-current text-secondary" aria-hidden />
            {t.ratingAvg ? t.ratingAvg.toFixed(1) : 'New'}
            {t.ratingCount > 0 && <span>({t.ratingCount})</span>}
          </span>
          <span className="font-medium text-on-surface">{formatKsh(t.sessionRateKsh)}</span>
        </div>
      </Card>
    </Link>
  );
}
