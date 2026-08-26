import type { Request } from 'express';
import { buildRequestContext } from './request-context';

function requestWith(
  headers: Record<string, string | string[] | undefined>,
  remoteAddress?: string,
): Request {
  return { headers, socket: { remoteAddress } } as unknown as Request;
}

describe('buildRequestContext', () => {
  it('takes the first hop of an x-forwarded-for chain', () => {
    expect(
      buildRequestContext(
        requestWith({ 'x-forwarded-for': '41.90.1.1, 10.0.0.1', 'user-agent': 'jest' }, '10.0.0.2'),
      ),
    ).toEqual({ ipAddress: '41.90.1.1', userAgent: 'jest' });
  });

  it('handles a repeated x-forwarded-for header', () => {
    expect(
      buildRequestContext(requestWith({ 'x-forwarded-for': ['41.90.1.1', '10.0.0.1'] })).ipAddress,
    ).toBe('41.90.1.1');
  });

  it('falls back to the socket address when unproxied', () => {
    expect(buildRequestContext(requestWith({}, '10.0.0.2'))).toEqual({
      ipAddress: '10.0.0.2',
      userAgent: null,
    });
  });

  it('returns nulls when neither the header nor the socket has an address', () => {
    expect(buildRequestContext(requestWith({}))).toEqual({ ipAddress: null, userAgent: null });
  });
});
