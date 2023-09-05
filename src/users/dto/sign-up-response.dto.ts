import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponse {
  @ApiProperty({
    description: '생성된 사용자의 아이디',
    example: 1,
  })
  readonly userId: number;
}
