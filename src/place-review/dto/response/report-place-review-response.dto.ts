import { ApiProperty } from '@nestjs/swagger';

export class ReportPlaceReviewResponse {
  @ApiProperty({ description: '신고 시간', example: new Date() })
  reportedAt: Date;

  @ApiProperty({ description: '신고한 리뷰의 아이디', example: 1 })
  reportedPlaceReviewId: number;
}
