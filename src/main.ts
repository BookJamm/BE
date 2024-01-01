import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { WinstonModule, utilities } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { AppModule } from './app.module';
import {
  AnyErrorExceptionFilter,
  BaseExceptionFilter,
  DatabaseExceptionFilter,
  NoHandlerFoundExceptionFilter,
  ValidationErrorExceptionFilter,
} from './global/filter/http-exception.filter';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new transports.Console({
          level: 'debug',
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            utilities.format.nestLike('BookJam', {
              prettyPrint: true,
              colors: true,
            }),
          ),
        }),
        new transports.DailyRotateFile({
          level: 'error',
          filename: 'logs/%DATE%-error.log',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.DailyRotateFile({
          level: 'info',
          filename: 'logs/%DATE%.log',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
      ],
    }),
  });

  // Documentation
  setupSwagger(app);

  // Request Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: errors => {
        let message = '';
        errors.map(error => {
          Object.keys(error.constraints).map(key => {
            message += `${error.property}: ${error.constraints[key]}\n`;
          });
        });

        throw new BadRequestException(message);
      },
      whitelist: true,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Exception Handler
  // 아래에서 위로 순위가 낮아짐
  app.useGlobalFilters(
    new AnyErrorExceptionFilter(),
    new DatabaseExceptionFilter(),
    new NoHandlerFoundExceptionFilter(),
    new ValidationErrorExceptionFilter(),
    new BaseExceptionFilter(),
  );

  await app.listen(3000);
}
bootstrap();
