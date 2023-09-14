import { ApiProperty } from '@nestjs/swagger';

export class EmailCheckResponse {
  @ApiProperty({
    description: '이메일 사용 가능 여부',
    example: true,
  })
  availabe: boolean;
}
