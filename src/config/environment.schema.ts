import { z } from 'zod';

// Treat a blank env var (e.g. `AWS_REGION=`) the same as an unset one, so
// `.optional()` behaves as expected for values that are documented but empty.
const optionalString = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().min(1).optional(),
);

export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().max(65_535).default(8080),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (value) =>
        value.startsWith('postgresql://') || value.startsWith('postgres://'),
      {
        message: 'DATABASE_URL must be a PostgreSQL connection URL',
      },
    ),
  // Optional until the auth layer is built. Swap `optionalString` for
  // `z.string().min(1)` (required) once Cognito integration lands.
  AWS_REGION: optionalString,

  AWS_COGNITO_USER_POOL_ID: optionalString,

  AWS_COGNITO_CLIENT_ID: optionalString,

  ALLOW_ORIGIN: z.string().min(1),
});

export type EnvironmentVariables = z.infer<typeof environmentSchema>;
