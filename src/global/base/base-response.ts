import { GlobalResponseCode } from './global-respose-code';
import { ResponseCode } from './response-code';

export class BaseResponse<T> {
  private status: number;

  private code: string;

  private message: string;

  private result: T;

  private constructor(result: T, code?: ResponseCode) {
    this.status = code?.getStatus() ?? GlobalResponseCode.OK.getStatus();
    this.code = code?.getCode() ?? GlobalResponseCode.OK.getCode();
    this.message = code?.getMessage() ?? GlobalResponseCode.OK.getMessage();
    this.result = result;
  }

  public static of<T>(result: T, code?: ResponseCode): BaseResponse<T> {
    return new BaseResponse(result, code);
  }
}
