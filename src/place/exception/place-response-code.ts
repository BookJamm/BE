import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const PlaceResponseCode = {
  INVALID_CATEGORY: new ResponseCode(
    HttpStatus.BAD_REQUEST,
    'PLACE_001',
    '카테고리가 유효하지 않습니다.',
  ),
  INVALID_SORT_CONDITION: new ResponseCode(
    HttpStatus.BAD_REQUEST,
    'PLACE_002',
    '정렬 조건이 유효하지 않습니다.',
  ),
  INVALID_LOCATION: new ResponseCode(
    HttpStatus.BAD_REQUEST,
    'PLACE_003',
    '위치가 유효하지 않습니다.',
  ),
  PLACE_NOT_FOUND: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'PLACE_004',
    '해당 장소가 존재하지 않습니다.',
  ),
  NEWS_NOT_FOUND: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'PLACE_005',
    '해당 소식이 존재하지 않습니다.',
  ),
};
