import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from './response-code';

export const GlobalResponseCode = {
  // 200
  OK: new ResponseCode(HttpStatus.OK, 'SUCCESS', '요청 성공'),
  CREATED: new ResponseCode(HttpStatus.CREATED, 'SUCCESS', '요청에 성공 및 리소스가 생성됨'),
  ACCEPTED: new ResponseCode(HttpStatus.ACCEPTED, 'SUCCESS', '요청 성공'),

  //400
  NOT_SUPPORTED_URI_ERROR: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'REQ_001',
    '지원하지 않는 URI입니다.',
  ),

  DB_ERROR: new ResponseCode(HttpStatus.INTERNAL_SERVER_ERROR, 'DB ERROR', ''),
  INTERNAL_ERROR: new ResponseCode(HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL ERROR', ''),
};
