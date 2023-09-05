import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { BaseException } from 'src/global/base/base-exception';
import { AuthResponseCode } from '../exception/auth-respone-code';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  logger = new Logger();
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (info instanceof TokenExpiredError) {
      throw BaseException.of(AuthResponseCode.EXPIRED_TOKEN);
    } else if (info instanceof JsonWebTokenError) {
      throw BaseException.of(AuthResponseCode.INVALID_TOKEN);
    } else if (info instanceof Error) {
      throw BaseException.of(AuthResponseCode.EMPTY_TOKEN);
    } else {
      return user;
    }
  }
}
