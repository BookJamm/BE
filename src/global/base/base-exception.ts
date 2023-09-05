import { HttpException } from '@nestjs/common';
import { ResponseCode } from './response-code';

export class BaseException extends HttpException {
  private code: ResponseCode;

  private constructor(code: ResponseCode) {
    super(code.getMessage(), code.getStatus());
    this.code = code;
  }

  public static of(code: ResponseCode): BaseException {
    return new BaseException(code);
  }

  public getCode(): ResponseCode {
    return this.code;
  }
}
