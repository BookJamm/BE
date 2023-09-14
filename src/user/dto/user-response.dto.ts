import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserResponse {
  @Type(() => Number)
  @ApiProperty({ description: '사용자 아이디', example: 1 })
  userId: number;

  @ApiProperty({
    description: '프로필 이미지 주소',
    example:
      'https://bookjam-bucket.s3.ap-northeast-2.amazonaws.com/1690391690485_beagle-hound-dog.webp',
  })
  profileImage: string;

  @ApiProperty({ description: '닉네임', example: '따봉도치' })
  usename: string;

  @ApiProperty({ description: '이메일', example: 'abc@naver.com' })
  email: string;

  @ApiProperty({ description: '해당 사용자 팔로우 여부', example: true })
  following: boolean = false;
}
