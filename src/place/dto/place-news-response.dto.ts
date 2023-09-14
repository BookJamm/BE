import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PlaceNewsResponse {
  @Type(() => Number)
  @ApiProperty({ description: '소식 아이디', example: 1 })
  newsId: number;

  @ApiProperty({ description: '소식 제목', example: '금일 매장 이용 공지' })
  title: string;

  @ApiProperty({
    description: '소식 내용',
    example: '독서 소모임 행사로 오늘 매장 이용이 어렵습니다. 양해부탁드립니다.',
  })
  contents: string;

  @ApiProperty({
    description: '소식 등록 시간',
    example: '2023-08-22T11:20:30.507Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '소식 수정 시간',
    example: '2023-08-22T11:20:30.507Z',
    nullable: true,
  })
  updatedAt: Date;
}
