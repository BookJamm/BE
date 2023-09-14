import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from './response-code';

export const GlobalResponseCode = {
  // 2XX
  OK: new ResponseCode(HttpStatus.OK, 'SUCCESS', '요청 성공'),
  CREATED: new ResponseCode(HttpStatus.CREATED, 'SUCCESS', '요청에 성공 및 리소스가 생성됨'),
  ACCEPTED: new ResponseCode(HttpStatus.ACCEPTED, 'SUCCESS', '요청 성공'),

  // 4XX
  NOT_SUPPORTED_URI_ERROR: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'REQ_001',
    '지원하지 않는 URI입니다.',
  ),
  EMPTY_KEYWORD: new ResponseCode(HttpStatus.BAD_REQUEST, 'REQ_002', '검색 키워드가 없습니다.'),

  // 5XX
  DB_ERROR: new ResponseCode(HttpStatus.INTERNAL_SERVER_ERROR, 'DB ERROR', ''),
  INTERNAL_ERROR: new ResponseCode(HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL ERROR', ''),
};
