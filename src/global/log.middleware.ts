import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body, headers } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const logFormat = `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}\n${JSON.stringify(
        { headers, body },
      )}`;

      if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn(logFormat);
      } else if (statusCode >= 500) {
        this.logger.error(logFormat);
      } else {
        this.logger.log(logFormat);
      }
    });

    next();
  }
}
