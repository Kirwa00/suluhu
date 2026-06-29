'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeading } from '@/components/app/stat-card';
import { messagingApi } from '@/lib/api/engagement-api';
import { cn } from '@/lib/utils';
import { formatDateTimeEAT } from '@/lib/format';

export function MessagesView() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(params.get('c'));
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagingApi.conversations(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const first = conversations?.[0];
    if (!selected && first) {
      setSelected(first.id);
    }
  }, [conversations, selected]);

  const { data: thread } = useQuery({
    queryKey: ['thread', selected],
    queryFn: () => messagingApi.messages(selected as string),
    enabled: Boolean(selected),
    refetchInterval: 4000,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length]);

  const send = useMutation({
    mutationFn: (body: string) => messagingApi.send(selected as string, body),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['thread', selected] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return (
    <div>
      <PageHeading title="Messages" subtitle="Secure, encrypted messaging with your care team." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <Card className="overflow-hidden">
          {!conversations || conversations.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant">
              No conversations yet. Start one from a booked session.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelected(c.id)}
                    className={cn(
                      'flex w-full items-start gap-3 p-4 text-left hover:bg-surface-container',
                      selected === c.id && 'bg-accent',
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-on-primary">
                      {c.counterpartName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between">
                        <span className="truncate font-medium text-on-surface">{c.counterpartName}</span>
                        {c.unread > 0 && (
                          <span className="ml-2 rounded-full bg-primary px-1.5 text-xs text-on-primary">
                            {c.unread}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-sm text-on-surface-variant">
                        {c.lastMessage ?? 'No messages yet'}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Thread */}
        <Card className="flex h-[70vh] flex-col">
          {!selected || !thread ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-on-surface-variant">
              <MessageSquare className="h-10 w-10" aria-hidden />
              <p>Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="border-b border-outline-variant p-4 font-medium text-on-surface">
                {thread.counterpartName}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {thread.messages.length === 0 && (
                  <p className="text-center text-sm text-on-surface-variant">
                    Say hello — messages are private and encrypted.
                  </p>
                )}
                {thread.messages.map((m) => (
                  <div key={m.id} className={cn('flex', m.mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                        m.mine
                          ? 'bg-primary-container text-on-primary'
                          : 'bg-surface-container text-on-surface',
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className={cn('mt-1 text-[10px]', m.mine ? 'text-on-primary/70' : 'text-on-surface-variant')}>
                        {formatDateTimeEAT(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form
                className="flex gap-2 border-t border-outline-variant p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) send.mutate(draft.trim());
                }}
              >
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  aria-label="Message"
                />
                <Button type="submit" disabled={!draft.trim() || send.isPending} aria-label="Send">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
