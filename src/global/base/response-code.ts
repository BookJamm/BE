import { HttpStatus } from '@nestjs/common';

export class ResponseCode {
  private status: HttpStatus;

  private code: string;

  private message: string;

  constructor(status: HttpStatus, code: string, message: string) {
    this.status = status;
    this.code = code;
    this.message = message;
  }

  public getStatus(): HttpStatus {
    return this.status;
  }

  public getCode(): string {
    return this.code;
  }

  public getMessage(): string {
    return this.message;
  }
}
