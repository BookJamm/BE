import { ApiProperty } from '@nestjs/swagger';
import { ImageResponse } from 'src/global/dto/image-response.dto';
import { AddressResponse } from './place-preview-response.dto';

export class PlaceDetailResponse {
  @ApiProperty({ description: '장소 아이디', example: 1 })
  placeId: number;

  @ApiProperty({ description: '상호명', example: '서른책방' })
  name: string;

  @ApiProperty({ description: '카테고리', enum: [0, 1, 2] })
  category: number;

  @ApiProperty({ description: '평점', example: 4.3 })
  rating: number;

  @ApiProperty({ description: '리뷰 개수', example: 5 })
  reviewCount: number;

  @ApiProperty({ description: '웹사이트 주소', example: 'http://www.instagram.com/30books' })
  website: string;

  @ApiProperty({ description: '주소' })
  address: AddressResponse;

  @ApiProperty({ description: '장소 이미지', type: [ImageResponse] })
  images: ImageResponse[];

  @ApiProperty({
    description: '영업 여부, 영업 여부를 알 수 없을 때는 null',
    example: true,
    nullable: true,
  })
  open: boolean;
}
