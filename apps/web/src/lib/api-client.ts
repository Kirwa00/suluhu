import type { ApiResponse } from '@suluhu/shared';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000') + '/api/v1';

/** Error thrown for any non-success API envelope, carrying the structured error. */
export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Access token for authenticated calls (wired up fully in M1). */
  accessToken?: string;
}

/**
 * Thin typed wrapper over fetch that understands the platform's API envelope
 * (SDLC §9.1). Returns `data` on success; throws `ApiClientError` otherwise.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, accessToken, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  let envelope: ApiResponse<T>;
  try {
    envelope = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('INTERNAL', 'Unexpected server response', response.status);
  }

  if (!response.ok || !envelope.success || envelope.error) {
    const err = envelope.error;
    throw new ApiClientError(
      err?.code ?? 'INTERNAL',
      err?.message ?? 'Request failed',
      response.status,
      err?.details,
    );
  }

  return envelope.data as T;
}
