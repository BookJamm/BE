import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const AuthResponseCode = {
  INVALID_LOGIN_REQ: new ResponseCode(
    HttpStatus.UNAUTHORIZED,
    'AUTH_001',
    '이메일 또는 비밀번호가 올바르지 않습니다.',
  ),
  INVALID_TOKEN: new ResponseCode(HttpStatus.UNAUTHORIZED, 'AUTH_002', '유효하지 않은 JWT 입니다.'),
  EXPIRED_TOKEN: new ResponseCode(
    HttpStatus.UNAUTHORIZED,
    'AUTH_003',
    'Access Token이 만료되었습니다.',
  ),
  EMPTY_TOKEN: new ResponseCode(HttpStatus.BAD_REQUEST, 'AUTH_003', 'JWT가 없습니다.'),
};
