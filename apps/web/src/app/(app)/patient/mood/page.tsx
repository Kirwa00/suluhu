'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MOOD_TAGS } from '@suluhu/shared';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PageHeading, StatCard } from '@/components/app/stat-card';
import { HeartPulse, Smile } from 'lucide-react';
import { moodApi } from '@/lib/api/engagement-api';
import { formatDate } from '@/lib/format';

function moodColor(score: number): string {
  if (score <= 3) return 'bg-destructive';
  if (score <= 6) return 'bg-safety-amber';
  return 'bg-success-calm';
}

export default function MoodJournalPage() {
  const queryClient = useQueryClient();
  const [score, setScore] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const { data } = useQuery({ queryKey: ['mood'], queryFn: () => moodApi.list() });

  const log = useMutation({
    mutationFn: () => moodApi.create({ moodScore: score, tags, note: note || undefined }),
    onSuccess: () => {
      setNote('');
      setTags([]);
      setScore(5);
      queryClient.invalidateQueries({ queryKey: ['mood'] });
    },
  });

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="max-w-3xl">
      <PageHeading title="Mood journal" subtitle="A private space to track how you feel over time." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Average mood" value={data?.average != null ? `${data.average}/10` : '—'} icon={Smile} tone="positive" />
        <StatCard label="Entries" value={String(data?.entries.length ?? 0)} icon={HeartPulse} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How are you feeling right now?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-on-surface-variant">
              <span>Low</span>
              <span className="font-display text-2xl font-bold text-on-surface">{score}</span>
              <span>Great</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-[#1b4f8c]"
              aria-label="Mood score"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-on-surface">Tags</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
                    tags.includes(t)
                      ? 'border-secondary bg-secondary-container/50 text-on-secondary-container'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Anything you'd like to note? (private)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <Button onClick={() => log.mutate()} disabled={log.isPending}>
            {log.isPending ? 'Saving…' : 'Log mood'}
          </Button>
        </CardContent>
      </Card>

      {data && data.trend.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1">
              {data.trend.map((p, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${moodColor(p.score)}`}
                  style={{ height: `${p.score * 10}%` }}
                  title={`${formatDate(p.date)}: ${p.score}/10`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.entries.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No entries yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {data.entries.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-on-surface">
                      <span className="font-medium">{e.moodScore}/10</span>
                      {e.tags.length > 0 && (
                        <span className="text-on-surface-variant"> · {e.tags.join(', ')}</span>
                      )}
                    </p>
                    {e.note && <p className="text-sm text-on-surface-variant">{e.note}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-on-surface-variant">{formatDate(e.loggedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
