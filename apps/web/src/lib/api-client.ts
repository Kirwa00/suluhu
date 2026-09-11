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
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      // A FormData body needs the browser to set its own multipart boundary.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
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

/**
 * Fetches a raw binary response (e.g. a document download) rather than the
 * JSON envelope — the API returns the file bytes directly for these routes.
 */
export async function apiFetchBlob(
  path: string,
  options: { accessToken?: string } = {},
): Promise<{ blob: Blob; filename: string | null }> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {},
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const envelope = (await response.json()) as ApiResponse<unknown>;
      message = envelope.error?.message ?? message;
    } catch {
      // Response wasn't JSON (e.g. the file streamed partially) — keep the default message.
    }
    throw new ApiClientError('INTERNAL', message, response.status);
  }

  const disposition = response.headers.get('content-disposition');
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/);
  const filename = match?.[1] ? decodeURIComponent(match[1]) : null;

  return { blob: await response.blob(), filename };
}
