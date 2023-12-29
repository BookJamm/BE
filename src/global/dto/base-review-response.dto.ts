import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ImageResponse } from './image-response.dto';

export class AuthorResponse {
  @Type(() => Number)
  @ApiProperty({ description: '사용자 아이디', example: 1 })
  userId: number;

  @ApiProperty({ description: '닉네임', example: '따봉도치' })
  username: string;

  @ApiProperty({
    description: '프로필 이미지',
    example: 'https://bookjam-bucket.s3.ap-northeast-2.amazonaws.com/v4q0b0ff4hcpew1g6t39.jpg',
  })
  profileImage: string;
}

export class BaseReviewResponse {
  @Type(() => Number)
  @ApiProperty({ description: '리뷰 아이디', example: 1 })
  reviewId: number;

  @ApiProperty({ description: '방문 날짜', example: '2023-08-07T15:00:00.000Z' })
  visitedAt: Date;

  @ApiProperty({ description: '평점', example: 4.5 })
  rating: number;

  @ApiProperty({ description: '리뷰 내용', example: '너무 좋아요' })
  contents: string;

  @ApiProperty({ description: '리뷰 이미지', type: [ImageResponse] })
  images: ImageResponse[];

  @Type(() => AuthorResponse)
  @ApiProperty({ description: '리뷰 작성자' })
  author: AuthorResponse;

  @ApiProperty({ description: '리뷰 작성 시간' })
  createdAt: Date;
  @ApiProperty({ description: '리뷰 수정 시간, 수정되지 않았으면 null', nullable: true })
  updatedAt: Date;
}
