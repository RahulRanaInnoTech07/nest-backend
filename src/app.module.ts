import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment.validation';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Pick the env file per environment via ENV_FILE (set by the npm
      // scripts), falling back to `.env`. In production, host-injected env
      // vars win and a missing file is fine.
      envFilePath: process.env.ENV_FILE ?? '.env',
      validate: validateEnvironment,
    }),
    AppConfigModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
