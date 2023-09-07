import { ApiProperty } from '@nestjs/swagger';
import { Type, plainToInstance } from 'class-transformer';

export type RawPlace = {
  placeId: string;
  name: string;
  rating: number;
  reviewCount: string;
  distance: number;
  road: string;
  jibun: string;
  lat: string;
  lon: string;
};

class Address {
  @ApiProperty({
    description: '도로명 주소',
    example: '경기 수원시 영통구 영통로174번길 79 1층 서른책방',
    nullable: true,
  })
  readonly road: string | null;

  @ApiProperty({
    description: '지번 주소',
    example: '망포동 345-15',
    nullable: true,
  })
  readonly jibun: string | null;
}

class Coords {
  @ApiProperty({
    description: '위도',
    example: 37.243771,
  })
  readonly lat: number;

  @ApiProperty({
    description: '경도',
    example: 127.059794,
  })
  readonly lon: number;
}

export class PlaceListResponse {
  @ApiProperty({ description: '장소 아이디', example: 1 })
  @Type(() => Number)
  readonly placeId: number;

  @ApiProperty({ description: '상호명', example: '서른책방' })
  readonly name: string;

  @ApiProperty({ description: '평점', example: 3.12 })
  readonly rating: number;

  @ApiProperty({ description: '리뷰 개수', example: 32 })
  @Type(() => Number)
  readonly reviewCount: number;

  @ApiProperty({ description: '현재 위치로부터 거리 (단위: km)', example: 1.02 })
  readonly distance: number;

  @ApiProperty({ description: '주소' })
  readonly address: Address;

  @ApiProperty({ description: '좌표' })
  readonly coords: Coords;

  public static from(raw: RawPlace): PlaceListResponse {
    const { road, jibun, lat, lon, ...rest } = raw;
    return plainToInstance(PlaceListResponse, {
      ...rest,
      address: { road, jibun },
      coords: { lat: Number(lat), lon: Number(lon) },
    });
  }
}
