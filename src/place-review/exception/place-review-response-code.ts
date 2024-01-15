import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const PlaceReviewResponseCode = {
  NOT_OWNER: new ResponseCode(
    HttpStatus.FORBIDDEN,
    'REVIEW_001',
    '해당 게시물의 작성자가 아닙니다.',
  ),
  REVIEW_NOT_FOUND: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'REVIEW_002',
    '해당 게시물을 찾을 수 없습니다.',
  ),
  REVIEW_ALREADY_REPORTED: new ResponseCode(
    HttpStatus.BAD_REQUEST,
    'REVIEW_003',
    '이미 신고된 리뷰입니다.',
  ),
  OWNER_REPORT: new ResponseCode(
    HttpStatus.BAD_REQUEST,
    'REVIEW_004',
    '자신의 글을 신고할 수 없습니다.',
  ),
  IMAGES_NUM_EXCEEDED: new ResponseCode(
    HttpStatus.NOT_ACCEPTABLE,
    'REVIEW_005',
    '업로드 할 사진이 너무 많습니다.',
  ),
  IMAGE_NOT_FOUND: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'REVIEW_006',
    '해당 이미지를 찾을 수 없습니다.',
  ),
};
