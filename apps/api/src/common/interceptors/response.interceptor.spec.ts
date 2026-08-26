import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { API_VERSION, type ApiResponse } from '@suluhu/shared';
import { firstValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

function contextWith(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function handlerFor<T>(data: T): CallHandler<T> {
  return { handle: () => of(data) };
}

async function intercept<T>(
  data: T,
  request: Record<string, unknown> = { requestId: 'req1' },
): Promise<ApiResponse<T>> {
  const interceptor = new ResponseInterceptor<T>();
  return firstValueFrom(interceptor.intercept(contextWith(request), handlerFor(data)));
}

describe('ResponseInterceptor', () => {
  it('wraps controller data in the standard envelope', async () => {
    const envelope = await intercept({ id: 'appt1' });
    expect(envelope).toMatchObject({
      success: true,
      data: { id: 'appt1' },
      error: null,
      meta: { version: API_VERSION, requestId: 'req1' },
    });
    expect(new Date(envelope.meta.timestamp).toISOString()).toBe(envelope.meta.timestamp);
  });

  it('normalizes an undefined controller result to null data', async () => {
    expect((await intercept(undefined)).data).toBeNull();
  });

  it('omits the requestId when the request has none', async () => {
    expect((await intercept('ok', {})).meta.requestId).toBeUndefined();
  });

  it('preserves falsy-but-present payloads', async () => {
    expect((await intercept(0)).data).toBe(0);
    expect((await intercept(false)).data).toBe(false);
  });
});
