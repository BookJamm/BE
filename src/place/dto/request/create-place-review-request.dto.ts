import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { IsPastOrPresent } from 'src/global/validation/decorator/is-past-or-present.decorator';

export class CreatePlaceReviewRequest {
  @ApiProperty({
    description: '방문 날짜 (ISO 8601 형식을 따름)',
    example: '2023-09-07',
  })
  @IsNotEmpty({ message: '방문 날짜는 비워둘 수 없습니다.' })
  @IsDateString(undefined, { message: '날짜 형식이 아닙니다.' })
  @IsPastOrPresent({ message: '방문 날짜는 현재거나 과거여야 합니다.' })
  readonly visitedAt: Date;

  @ApiProperty({
    description: '참여한 활동의 아이디',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber(undefined, { message: '참여한 활동 아이디는 정수여야 합니다.' })
  readonly activityId?: number;

  @ApiProperty({
    description: '리뷰 내용',
    example: '즐거운 독서 생활',
  })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용은 비워둘 수 없습니다.' })
  @Length(1, 300, { message: '내용은 300자 이하여야 합니다.' })
  readonly contents: string;

  @ApiProperty({
    description: '장소 평점, 0점 ~ 5점 사이',
    example: 4.2,
  })
  @Type(() => Number)
  @IsNumber(undefined, { message: '평점은 숫자여야 합니다.' })
  @IsNotEmpty({ message: '평점은 비워둘 수 없습니다.' })
  @Min(0, { message: '평점은 0점 이상 5점 이하여야 합니다.' })
  @Max(5, { message: '평점은 0점 이상 5점 이하여야 합니다.' })
  readonly rating: number;

  @ApiProperty({
    description: '댓글 허용 여부',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean({ message: '댓글 비허용 여부는 boolean 값이어야 합니다.' })
  readonly commentAllowed: boolean;
}
