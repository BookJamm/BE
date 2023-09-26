import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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

  // Exception Handler
  app.useGlobalFilters(
    new AnyErrorExceptionFilter(), // 3rd
    new DatabaseExceptionFilter(), // 2nd
    new NoHandlerFoundExceptionFilter(),
    new ValidationErrorExceptionFilter(),
    new BaseExceptionFilter(), // 1st
  );

  await app.listen(3000);
}
bootstrap();
