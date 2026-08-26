import type { NextFunction, Request, Response } from 'express';
import { RequestIdMiddleware } from './request-id.middleware';

function run(incoming?: string) {
  const req = { header: (name: string) => (name === 'x-request-id' ? incoming : undefined) };
  const setHeader = jest.fn();
  const next = jest.fn();
  new RequestIdMiddleware().use(
    req as unknown as Request,
    { setHeader } as unknown as Response,
    next as unknown as NextFunction,
  );
  return { requestId: (req as unknown as Request).requestId, setHeader, next };
}

describe('RequestIdMiddleware', () => {
  it('propagates an incoming correlation id', () => {
    const { requestId, setHeader } = run('client-trace-1');
    expect(requestId).toBe('client-trace-1');
    expect(setHeader).toHaveBeenCalledWith('X-Request-Id', 'client-trace-1');
  });

  it('generates an id when the header is absent', () => {
    const { requestId, setHeader } = run();
    expect(requestId).toBeTruthy();
    expect(setHeader).toHaveBeenCalledWith('X-Request-Id', requestId);
  });

  it('ignores an empty or oversized incoming id', () => {
    expect(run('').requestId).toBeTruthy();
    const oversized = 'x'.repeat(65);
    expect(run(oversized).requestId).not.toBe(oversized);
    expect(run('x'.repeat(64)).requestId).toBe('x'.repeat(64));
  });

  it('always continues the middleware chain', () => {
    expect(run().next).toHaveBeenCalledTimes(1);
  });
});
