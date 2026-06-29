'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { sessionsApi, type SessionAccess } from '@/lib/api/sessions-api';
import { formatDateTimeEAT } from '@/lib/format';

export default function ConsultRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.access(id),
    enabled: Boolean(id),
    refetchInterval: (q) => {
      const phase = q.state.data?.phase;
      if (phase === 'WAITING') return 4000;
      if (phase === 'EARLY') return 15000;
      return false;
    },
  });

  const start = useMutation({
    mutationFn: () => sessionsApi.start(id),
    onSuccess: (d) => queryClient.setQueryData(['session', id], d),
  });
  const end = useMutation({
    mutationFn: () => sessionsApi.end(id),
    onSuccess: (d) => {
      queryClient.setQueryData(['session', id], d);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  if (data.phase === 'IN_SESSION' || (data.phase === 'READY' && data.isOwner && start.isSuccess)) {
    return (
      <ConsultRoom
        data={data}
        onLeave={() => router.push(data.isOwner ? '/therapist/schedule' : '/patient/sessions')}
        onEnd={data.isOwner ? () => end.mutate() : undefined}
        ending={end.isPending}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <StatusBody data={data} onStart={() => start.mutate()} starting={start.isPending} />
          <Link href={data.isOwner ? '/therapist/schedule' : '/patient/sessions'} className="text-sm text-secondary hover:underline">
            Back to sessions
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBody({
  data,
  onStart,
  starting,
}: {
  data: SessionAccess;
  onStart: () => void;
  starting: boolean;
}) {
  switch (data.phase) {
    case 'EARLY':
      return (
        <>
          <Clock className="h-12 w-12 text-primary" aria-hidden />
          <div>
            <p className="font-display text-xl font-semibold text-on-surface">Not started yet</p>
            <p className="text-on-surface-variant">
              Your session with {data.counterpartName} begins {formatDateTimeEAT(data.scheduledAt)}.
              {typeof data.startsInMinutes === 'number' && data.startsInMinutes > 0
                ? ` (~${data.startsInMinutes} min)`
                : ''}{' '}
              You can join 15 minutes before.
            </p>
          </div>
        </>
      );
    case 'WAITING':
      return (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
          <div>
            <p className="font-display text-xl font-semibold text-on-surface">You’re in the waiting room</p>
            <p className="text-on-surface-variant">
              {data.counterpartName} will admit you when they’re ready. Please hold on.
            </p>
          </div>
        </>
      );
    case 'READY':
      return (
        <>
          <VideoIcon className="h-12 w-12 text-secondary" aria-hidden />
          <div>
            <p className="font-display text-xl font-semibold text-on-surface">Ready to begin</p>
            <p className="text-on-surface-variant">
              Your patient {data.counterpartName} may be waiting. Start when you’re ready.
            </p>
          </div>
          <Button size="lg" onClick={onStart} disabled={starting}>
            {starting ? 'Starting…' : 'Start session'}
          </Button>
        </>
      );
    case 'ENDED':
      return (
        <>
          <PhoneOff className="h-12 w-12 text-on-surface-variant" aria-hidden />
          <p className="font-display text-xl font-semibold text-on-surface">This session has ended</p>
        </>
      );
    case 'EXPIRED':
      return (
        <p className="font-display text-lg font-semibold text-on-surface">
          The join window for this session has closed.
        </p>
      );
    case 'CANCELLED':
      return <p className="font-display text-lg font-semibold text-on-surface">This session was cancelled.</p>;
    case 'UNPAID':
      return (
        <p className="font-display text-lg font-semibold text-on-surface">
          Payment is still pending for this session.
        </p>
      );
    default:
      return null;
  }
}

function ConsultRoom({
  data,
  onLeave,
  onEnd,
  ending,
}: {
  data: SessionAccess;
  onLeave: () => void;
  onEnd?: () => void;
  ending: boolean;
}) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-on-surface">
          Session with {data.counterpartName}
        </p>
        <span className="flex items-center gap-1.5 rounded-full bg-secondary-container/50 px-3 py-1 text-xs font-medium text-on-secondary-container">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success-calm" /> Live
        </span>
      </div>

      {/* Video stage (mock provider — real Daily.co iframe mounts here in production). */}
      <div className="relative grid gap-3 rounded-xl bg-inverse-surface p-3 sm:grid-cols-2">
        <VideoTile label={data.counterpartName} muted={false} />
        <VideoTile label="You" muted={!micOn} cameraOff={!camOn} />
        <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-inverse-on-surface/50">
          Secure WebRTC room · {data.roomUrl}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setMicOn((v) => !v)}
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            micOn ? 'bg-surface-container text-on-surface' : 'bg-error-container text-on-error-container'
          }`}
          aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        <button
          onClick={() => setCamOn((v) => !v)}
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            camOn ? 'bg-surface-container text-on-surface' : 'bg-error-container text-on-error-container'
          }`}
          aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
        >
          {camOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
        <Button variant="destructive" onClick={onLeave} className="h-12 rounded-full px-6">
          <PhoneOff className="h-5 w-5" />
          Leave
        </Button>
        {onEnd && (
          <Button onClick={onEnd} disabled={ending} className="h-12 rounded-full px-6">
            {ending ? 'Ending…' : 'End session'}
          </Button>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-on-surface-variant">
        This is a simulated consult room (mock video provider). With Daily.co credentials, the live
        encrypted video mounts in the stage above.
      </p>
    </div>
  );
}

function VideoTile({
  label,
  muted,
  cameraOff,
}: {
  label: string;
  muted: boolean;
  cameraOff?: boolean;
}) {
  return (
    <div className="relative flex aspect-video items-center justify-center rounded-lg bg-[#0f1c2c]">
      {cameraOff ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-xl font-semibold text-on-primary">
          {label[0]}
        </div>
      ) : (
        <span className="text-sm text-inverse-on-surface/70">{label}</span>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/40 px-2 py-0.5 text-xs text-white">
        {muted && <MicOff className="h-3 w-3" aria-hidden />}
        {label}
      </div>
    </div>
  );
}
