import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class CreateReviewRequest {
  @ApiProperty({
    description: '방문 날짜 (ISO 8601 형식을 따름)',
    example: '2023-09-07',
  })
  @IsDateString(undefined, { message: '날짜 형식이 아닙니다.' })
  @IsNotEmpty({ message: '방문 날짜는 비워둘 수 없습니다.' })
  readonly visitedAt: Date;

  @IsString()
  @IsNotEmpty({ message: '내용은 비워둘 수 없습니다.' })
  @Length(1, 300, { message: '내용은 300자 이하여야 합니다.' })
  readonly contents: string;

  @IsNumber(undefined, { message: '별점은 숫자여야 합니다.' })
  @IsNotEmpty({ message: '별점은 비워둘 수 없습니다.' })
  @Min(0, { message: '평점은 0점 이상 5점 이하여야 합니다.' })
  @Max(5, { message: '평점은 0점 이상 5점 이하여야 합니다.' })
  readonly rating: number;
}
