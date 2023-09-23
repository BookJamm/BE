import { ApiProperty } from '@nestjs/swagger';

export class postRecordResponse {
  @ApiProperty({
    description: '기록 생성 여부 (정상적으로 삭제된 경우 true, false는 존재하지 않음',
  })
  readonly created: boolean;
}
