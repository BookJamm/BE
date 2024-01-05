import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const AuthResponseCode = {
  INVALID_LOGIN_REQ: new ResponseCode(
    HttpStatus.UNAUTHORIZED,
    'AUTH_001',
    '이메일 또는 비밀번호가 올바르지 않습니다.',
  ),
  INVALID_TOKEN: new ResponseCode(
    HttpStatus.UNAUTHORIZED,
    'AUTH_002',
    '유효하지 않은 토큰 입니다.',
  ),
  EXPIRED_TOKEN: new ResponseCode(HttpStatus.UNAUTHORIZED, 'AUTH_003', '토큰이 만료되었습니다.'),
  EMPTY_TOKEN: new ResponseCode(HttpStatus.BAD_REQUEST, 'AUTH_004', '토큰이 없습니다.'),
  KAKAO_REQUEST_FAILED: new ResponseCode(
    HttpStatus.UNAUTHORIZED,
    'AUTH_005',
    '카카오 인증 서버에서 데이터를 받아오지 못했습니다.',
  ),
  APPLE_REQUEST_FAILED: new ResponseCode(
    HttpStatus.UNAUTHORIZED,
    'AUTH_006',
    '애플 인증 서버에서 데이터를 받지 못했습니다.',
  ),
  INVALID_APPLE_ISSUER: new ResponseCode(
    HttpStatus.FORBIDDEN,
    'AUTH_007',
    '애플에서 발행한 토큰이 아닙니다.',
  ),
  INVALID_APPLE_AUDIENCE: new ResponseCode(
    HttpStatus.UNAUTHORIZED,
    'AUTH_008',
    'Bookjam 앱을 사용하려는 유저가 아닙니다.',
  ),
};
