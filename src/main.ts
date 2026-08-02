import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  app.enableCors({
    origin: config.allowedOrigins,
    credentials: true,
  });

  await app.listen(config.port);

  console.log(
    `KAIROS API listening on http://localhost:${config.port} [${config.nodeEnv}]`,
  );
}
void bootstrap();
