import { ApiProperty } from '@nestjs/swagger';

export class ReportUserResponse {
  @ApiProperty({ description: '신고 당한 사용자의 아이디', example: 1 })
  reportedUserId: number;
  @ApiProperty({ description: '신고 시간', example: new Date() })
  reportedAt: Date;
}
