import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  setupSwagger(app);

  await app.listen(3000);
}
bootstrap();
