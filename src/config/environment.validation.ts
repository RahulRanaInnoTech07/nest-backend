import { ZodError } from 'zod';

import { EnvironmentVariables, environmentSchema } from './environment.schema';

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const errors = formatEnvironmentErrors(result.error);

    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}

function formatEnvironmentErrors(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.join('.') || 'environment';

      return `- ${field}: ${issue.message}`;
    })
    .join('\n');
}
