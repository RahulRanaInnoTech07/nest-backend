import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

/**
 * Validates and parses request payloads against a Zod schema.
 *
 * Usage:
 *   @Post()
 *   create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto) {}
 *
 * The parsed, typed value is returned; invalid input throws a 400 with a
 * field-keyed error map.
 */
@Injectable()
export class ZodValidationPipe<TOutput = unknown> implements PipeTransform<
  unknown,
  TOutput
> {
  constructor(private readonly schema: ZodType<TOutput>) {}

  transform(value: unknown): TOutput {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formatZodIssues(result.error),
      });
    }

    return result.data;
  }
}

function formatZodIssues(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'root';
    fieldErrors[key] ??= issue.message;
  }

  return fieldErrors;
}
