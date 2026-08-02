import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { AppConfigService } from '../config/app-config.service';

/** DI token for the Drizzle database instance. */
export const DRIZZLE = Symbol('DRIZZLE');

function createDatabase(config: AppConfigService) {
  const pool = new Pool({ connectionString: config.databaseUrl });
  return drizzle({ client: pool });
}

/** Inject with `@Inject(DRIZZLE) private readonly db: Database`. */
export type Database = ReturnType<typeof createDatabase>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [AppConfigService],
      useFactory: createDatabase,
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async onModuleDestroy(): Promise<void> {
    // Close the underlying pg pool on shutdown.
    await this.db.$client.end();
  }
}
