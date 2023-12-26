import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ImageResponse } from 'src/global/dto/image-response.dto';
import { PlaceReviewImage } from 'src/place-review/entity/place-review-image.entity';

export type RawPlace = {
  placeId: number;
  name: string;
  rating: number;
  reviewCount: string;
  distance: number;
  road: string;
  jibun: string;
  lat: string;
  lon: string;
  images?: PlaceReviewImage[];
  open?: boolean;
};

export class AddressResponse {
  @ApiProperty({
    description: '도로명 주소',
    example: '경기 수원시 영통구 영통로174번길 79 1층 서른책방',
    nullable: true,
  })
  road?: string;

  @ApiProperty({
    description: '지번 주소',
    example: '망포동 345-15',
    nullable: true,
  })
  jibun?: string;
}

export class Coords {
  @ApiProperty({
    description: '위도',
    example: 37.243771,
  })
  lat: number;

  @ApiProperty({
    description: '경도',
    example: 127.059794,
  })
  lon: number;
}

export class PlacePreviewResponse {
  @ApiProperty({ description: '장소 아이디', example: 1 })
  @Type(() => Number)
  placeId: number;

  @ApiProperty({ description: '상호명', example: '서른책방' })
  name: string;

  @ApiProperty({ description: '평점', example: 3.12 })
  rating: number;

  @ApiProperty({ description: '리뷰 개수', example: 32 })
  @Type(() => Number)
  reviewCount: number;

  @ApiProperty({ description: '현재 위치로부터 거리 (단위: km)', example: 1.02 })
  distance: number;

  @ApiProperty({
    description: '영업 여부, 영업 여부를 알 수 없을 경우 null',
    example: true,
    nullable: true,
  })
  open: boolean;

  @ApiProperty({ description: '주소' })
  @Type(() => AddressResponse)
  address: AddressResponse;

  @ApiProperty({ description: '좌표' })
  @Type(() => Coords)
  coords: Coords;

  @ApiProperty({ description: '장소 이미지', type: [ImageResponse] })
  @Type(() => ImageResponse)
  images: ImageResponse[];
}
