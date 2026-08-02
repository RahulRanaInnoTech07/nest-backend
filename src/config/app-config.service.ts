import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from './environment.schema';

/**
 * Type-safe accessor over the validated environment. Inject this instead of
 * reading `process.env` directly so every consumer gets the parsed, typed value.
 */
@Injectable()
export class AppConfigService {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  get nodeEnv(): EnvironmentVariables['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  /** ALLOW_ORIGIN is a comma-separated list; expose it as a clean array. */
  get allowedOrigins(): string[] {
    return this.config
      .get('ALLOW_ORIGIN', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get awsRegion(): string | undefined {
    return this.config.get('AWS_REGION', { infer: true });
  }

  get cognitoUserPoolId(): string | undefined {
    return this.config.get('AWS_COGNITO_USER_POOL_ID', { infer: true });
  }

  get cognitoClientId(): string | undefined {
    return this.config.get('AWS_COGNITO_CLIENT_ID', { infer: true });
  }
}
