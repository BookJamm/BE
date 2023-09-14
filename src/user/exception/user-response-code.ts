import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const UserResponseCode = {
  INVALID_PASSWORD_PATTERN: new ResponseCode(
    HttpStatus.BAD_REQUEST,
    'USER_001',
    '비밀번호 형식이 아닙니',
  ),
  USER_NOT_FOUND: new ResponseCode(HttpStatus.NOT_FOUND, 'USER_002', '해당 유저가 없습니다.'),
  FOLLOW_MYSELF: new ResponseCode(
    HttpStatus.BAD_REQUEST,
    'USER_003',
    '나를 팔로우 할 수 없습니다.',
  ),
};
