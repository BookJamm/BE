import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceReviewResponse {
  @ApiProperty({ description: '생성된 리뷰의 아이디', example: 1 })
  readonly reviewId: number;
}
