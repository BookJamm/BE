import { ResponseCode } from './response-code';

export class ErrorResponse {
  private status: number;

  private code: string;

  private message: string;

  public constructor(code: ResponseCode, message?: string) {
    this.status = code.getStatus().valueOf();
    this.code = code.getCode();
    this.message = message ?? code.getMessage();
  }
}
