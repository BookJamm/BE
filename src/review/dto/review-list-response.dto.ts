import { ApiProperty } from '@nestjs/swagger';
import { Type, plainToInstance } from 'class-transformer';
import { ImageResponse } from 'src/global/dto/image.dto';
import { ReviewImage } from '../entity/review-image.entity';

export type RawReview = {
  reviewId: string;
  visitedAt: Date;
  rating: number;
  userId: string;
  username: string;
  profileImage: string;
};

class Author {
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

export class ReviewListResponse {
  @Type(() => Number)
  @ApiProperty({ description: '리뷰 아이디', example: 1 })
  reviewId: number;

  @ApiProperty({ description: '방문 날짜', example: '2023-08-07T15:00:00.000Z' })
  visitedAt: Date;

  @ApiProperty({ description: '평점', example: 4.5 })
  rating: number;

  @ApiProperty({ description: '리뷰 이미지', type: [ImageResponse] })
  images: ImageResponse[];

  @Type(() => Author)
  @ApiProperty({ description: '리뷰 작성자' })
  author: Author;

  public static from(rawReview: RawReview): ReviewListResponse {
    const { userId, username, profileImage, ...rest } = rawReview;
    return plainToInstance(ReviewListResponse, {
      ...rest,
      author: { userId, username, profileImage },
    });
  }

  setImages(images: ReviewImage[]) {
    this.images = images;
  }
}
