import { ApiProperty } from '@nestjs/swagger';

export class ImageResponse {
  @ApiProperty({ description: '이미지 아이디', example: 1 })
  id: number;

  @ApiProperty({
    description: '이미지 주소',
    example: 'https://bookjam-bucket.s3.ap-northeast-2.amazonaws.com/1692703606807_boanbook.jpg',
  })
  imageUrl: string;
}
