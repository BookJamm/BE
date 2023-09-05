import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from './response-code';

export const GlobalResponseCode = {
  OK: new ResponseCode(HttpStatus.OK, 'SUCCESS', '요청 성공'),
  CREATED: new ResponseCode(HttpStatus.CREATED, 'SUCCESS', '요청에 성공 및 리소스가 생성됨'),
  ACCEPTED: new ResponseCode(HttpStatus.ACCEPTED, 'SUCCESS', '요청 성공'),

  DB_ERROR: new ResponseCode(HttpStatus.INTERNAL_SERVER_ERROR, 'DB ERROR', ''),
  INTERNAL_ERROR: new ResponseCode(HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL ERROR', ''),
};
