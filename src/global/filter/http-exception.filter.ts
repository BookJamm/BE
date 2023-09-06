import { ArgumentsHost, Catch, ExceptionFilter, Logger, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';
import { BaseException } from '../base/base-exception';
import { ErrorResponse } from '../base/error-response';
import { GlobalResponseCode } from '../base/global-respose-code';

@Catch(BaseException)
export class BaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const code = exception.getCode();

    response.status(status).json(new ErrorResponse(code));
  }
}

@Catch(TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const code = GlobalResponseCode.DB_ERROR;
    const status = code.getStatus();
    const { message } = exception;

    this.logger.error(exception.message, exception.stack);
    response.status(status).json(new ErrorResponse(code, message));
  }
}

@Catch(NotFoundException)
export class NoHandlerFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const code = GlobalResponseCode.NOT_SUPPORTED_URI_ERROR;
    const status = code.getStatus();

    response.status(status).json(new ErrorResponse(code));
  }
}

@Catch(Error)
export class AnyErrorExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const code = GlobalResponseCode.INTERNAL_ERROR;
    const status = code.getStatus();
    const { message } = exception;

    this.logger.error(exception.message, exception.stack);
    response.status(status).json(new ErrorResponse(code, message));
  }
}
