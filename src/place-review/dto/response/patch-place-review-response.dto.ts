import { ApiProperty } from '@nestjs/swagger';

export class PatchPlaceReviewResponse {
  @ApiProperty({ description: '수정된 리뷰 아이디', example: 1 })
  updatedReviewId: number;

  @ApiProperty({ description: '수정된 날짜', example: new Date() })
  updatedAt: Date;
}
