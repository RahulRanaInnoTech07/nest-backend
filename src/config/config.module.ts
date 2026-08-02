import { Global, Module } from '@nestjs/common';

import { AppConfigService } from './app-config.service';

/**
 * Global module exposing the typed {@link AppConfigService} everywhere.
 * Assumes `ConfigModule.forRoot({ isGlobal: true })` is registered in AppModule.
 */
@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
