import type { ArgumentMetadata } from '@nestjs/common';
import { ErrorCode } from '@suluhu/shared';
import { z } from 'zod';
import { AppException } from '../exceptions/app.exception';
import { ZodValidationPipe } from './zod-validation.pipe';

const META: ArgumentMetadata = { type: 'body' };

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  nested: z.object({ age: z.number().int('Age must be a whole number') }),
});

describe('ZodValidationPipe', () => {
  it('returns the parsed (and transformed) value', () => {
    const pipe = new ZodValidationPipe(z.object({ page: z.coerce.number().default(1) }));
    expect(pipe.transform({ page: '3' }, META)).toEqual({ page: 3 });
  });

  it('maps issues to dotted field paths in the error details', () => {
    const pipe = new ZodValidationPipe(schema);
    try {
      pipe.transform({ email: 'nope', nested: { age: 1.5 } }, META);
      throw new Error('expected the pipe to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppException);
      const ex = error as AppException;
      expect(ex.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(ex.details).toEqual({
        email: ['Enter a valid email address'],
        'nested.age': ['Age must be a whole number'],
      });
    }
  });

  it('groups multiple issues for the same field', () => {
    const pipe = new ZodValidationPipe(
      z.object({ password: z.string().min(8, 'Too short').regex(/\d/, 'Include a number') }),
    );
    try {
      pipe.transform({ password: 'short' }, META);
      throw new Error('expected the pipe to throw');
    } catch (error) {
      expect((error as AppException).details).toEqual({
        password: ['Too short', 'Include a number'],
      });
    }
  });

  it('keys root-level issues under `_`', () => {
    const pipe = new ZodValidationPipe(z.string());
    try {
      pipe.transform(42, META);
      throw new Error('expected the pipe to throw');
    } catch (error) {
      expect(Object.keys((error as AppException).details ?? {})).toEqual(['_']);
    }
  });

  it('rethrows non-Zod errors untouched', () => {
    const boom = new Error('transform exploded');
    const pipe = new ZodValidationPipe({
      parse: () => {
        throw boom;
      },
    } as unknown as z.ZodSchema<unknown>);
    expect(() => pipe.transform({}, META)).toThrow(boom);
  });
});
