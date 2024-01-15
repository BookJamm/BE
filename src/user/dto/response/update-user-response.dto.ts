import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserResponse {
  @ApiProperty({ description: '변경된 닉네임', example: '보노보노' })
  updatedUsername: string;
  @ApiProperty({ description: '변경된 시간', example: new Date() })
  updatedAt: Date;
}
