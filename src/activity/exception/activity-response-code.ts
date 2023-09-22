import { HttpStatus } from '@nestjs/common';
import { ResponseCode } from 'src/global/base/response-code';

export const ActivityResponseCode = {
  ACTIVITY_NOT_FOUND: new ResponseCode(
    HttpStatus.NOT_FOUND,
    'ACTI_001',
    '해당 활동이 존재하지 않습니다.',
  ),
};
