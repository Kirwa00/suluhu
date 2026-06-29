import type { ContentResourceInput, MoodEntryInput } from '@suluhu/shared';
import { apiFetch } from '@/lib/api-client';
import { tokenStore } from '@/lib/auth/token-store';

function auth() {
  return tokenStore.access ?? undefined;
}

// --- Messaging ---
export interface ConversationSummary {
  id: string;
  counterpartName: string;
  counterpartId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: number;
}
export interface ChatMessage {
  id: string;
  mine: boolean;
  body: string;
  createdAt: string;
  readAt: string | null;
}
export interface Thread {
  conversationId: string;
  counterpartName: string;
  messages: ChatMessage[];
}

export const messagingApi = {
  conversations() {
    return apiFetch<ConversationSummary[]>('/conversations', { accessToken: auth() });
  },
  open(counterpartId: string) {
    return apiFetch<{ id: string }>('/conversations', {
      method: 'POST',
      body: { counterpartId },
      accessToken: auth(),
    });
  },
  messages(conversationId: string) {
    return apiFetch<Thread>(`/conversations/${conversationId}/messages`, { accessToken: auth() });
  },
  send(conversationId: string, body: string) {
    return apiFetch<ChatMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { body },
      accessToken: auth(),
    });
  },
};

// --- Mood ---
export interface MoodEntryView {
  id: string;
  moodScore: number;
  note: string;
  tags: string[];
  loggedAt: string;
}
export interface MoodData {
  entries: MoodEntryView[];
  trend: { date: string; score: number }[];
  average: number | null;
}

export const moodApi = {
  list() {
    return apiFetch<MoodData>('/mood', { accessToken: auth() });
  },
  create(input: MoodEntryInput) {
    return apiFetch<MoodEntryView>('/mood', { method: 'POST', body: input, accessToken: auth() });
  },
};

// --- Content ---
export interface ContentCard {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  type: string;
  language: string;
  createdAt: string;
}
export interface ContentDetail extends ContentCard {
  body: string;
}
export interface AdminContentRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  language: string;
  published: boolean;
  updatedAt: string;
}

export const contentApi = {
  list(params: { category?: string; type?: string } = {}) {
    const sp = new URLSearchParams();
    if (params.category) sp.set('category', params.category);
    if (params.type) sp.set('type', params.type);
    const qs = sp.toString();
    return apiFetch<ContentCard[]>(`/content${qs ? `?${qs}` : ''}`, { accessToken: auth() });
  },
  get(slug: string) {
    return apiFetch<ContentDetail>(`/content/${slug}`, { accessToken: auth() });
  },
  adminList() {
    return apiFetch<AdminContentRow[]>('/admin/content', { accessToken: auth() });
  },
  create(input: ContentResourceInput) {
    return apiFetch<{ id: string; slug: string }>('/admin/content', {
      method: 'POST',
      body: input,
      accessToken: auth(),
    });
  },
};
