import { ApiProperty } from '@nestjs/swagger';

export class ActivityDetailResponse {
  @ApiProperty({ description: '활동 이름', example: '낭독회' })
  title: string;

  @ApiProperty({
    description: '활동 이미지',
    example: 'https://bookjam-bucket.s3.ap-northeast-2.amazonaws.com/image.png',
    nullable: true,
  })
  imageUrl: string;

  @ApiProperty({ description: '활동 정보', example: '낭독회 엽니다.' })
  info: string;

  @ApiProperty({ description: '현재 참여 인원', example: 5 })
  headcount: number;

  @ApiProperty({ description: '정원', example: 10 })
  capacity: number;

  @ApiProperty({ description: '평점', example: 4.5 })
  rating: number;

  @ApiProperty({ description: '리뷰 개수', example: 5 })
  reviewCount: number;

  @ApiProperty({ description: '좋아요 여부' })
  liked: boolean;
}
