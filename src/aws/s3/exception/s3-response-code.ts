import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const S3ResponseCode = {
  UPLOAD_FAILED: new ResponseCode(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'S3_001',
    'S3 파일 업로드 실패',
  ),
  DELETE_FAILED: new ResponseCode(HttpStatus.INTERNAL_SERVER_ERROR, 'S3_002', 'S3 파일 삭제 실패'),
};
