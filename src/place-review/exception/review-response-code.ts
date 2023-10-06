import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const ReviewResponseCode = {
  NOT_OWNER: new ResponseCode(
    HttpStatus.FORBIDDEN,
    'REVIEW_002',
    '해당 게시물의 작성자가 아닙니다.',
  ),
  REVIEW_NOT_FOUND: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'REVIEW_003',
    '해당 게시물을 찾을 수 없습니다.',
  ),
};
