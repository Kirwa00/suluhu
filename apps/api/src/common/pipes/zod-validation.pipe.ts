import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';
import { AppException } from '../exceptions/app.exception';

/**
 * Validates and transforms request payloads against a Zod schema, surfacing
 * field-level issues in the standard error envelope's `details`.
 *
 * Usage: `@Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput`
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || '_';
          (details[path] ??= []).push(issue.message);
        }
        throw AppException.validation(details);
      }
      throw error;
    }
  }
}
