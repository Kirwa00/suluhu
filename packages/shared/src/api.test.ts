import { describe, expect, it } from 'vitest';
import { API_VERSION, ErrorCode, type ApiResponse, type Paginated } from './api';

describe('API envelope contract', () => {
  it('pins the current API version', () => {
    expect(API_VERSION).toBe('v1');
  });

  it('types a success envelope with data and no error', () => {
    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: 'appt1' },
      meta: { timestamp: '2031-06-10T06:00:00.000Z', version: API_VERSION, requestId: 'req1' },
      error: null,
    };
    expect(response.data?.id).toBe('appt1');
    expect(response.error).toBeNull();
  });

  it('types a paginated payload', () => {
    const page: Paginated<string> = {
      items: ['a', 'b'],
      pagination: {
        page: 1,
        pageSize: 2,
        totalItems: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    };
    expect(page.pagination.totalPages).toBe(3);
  });
});

describe('ErrorCode', () => {
  it('uses each key as its own value so codes stay stable on the wire', () => {
    for (const [key, value] of Object.entries(ErrorCode)) {
      expect(value).toBe(key);
    }
  });

  it('covers the envelope error codes the API filter maps HTTP statuses to', () => {
    expect(Object.values(ErrorCode)).toEqual(
      expect.arrayContaining([
        ErrorCode.VALIDATION_FAILED,
        ErrorCode.UNAUTHENTICATED,
        ErrorCode.FORBIDDEN,
        ErrorCode.NOT_FOUND,
        ErrorCode.CONFLICT,
        ErrorCode.RATE_LIMITED,
        ErrorCode.INTERNAL,
      ]),
    );
  });
});
