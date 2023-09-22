import { ApiProperty } from '@nestjs/swagger';

export class ActivityListResponse {
  @ApiProperty({ description: '활동 아이디' })
  activityId: number;

  @ApiProperty({ description: '활동 이름' })
  title: string;

  @ApiProperty({ description: '활동 정보' })
  info: string;

  @ApiProperty({ description: '평점' })
  rating: number;

  @ApiProperty({ description: '활동 사진' })
  imageUrl: string;

  @ApiProperty({ description: '리뷰 개수' })
  reviewCount: number;
}
