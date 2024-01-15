import { ApiProperty } from '@nestjs/swagger';
import { IsByteLength, IsNotEmpty, IsString } from 'class-validator';

export class QuestionRequest {
  @ApiProperty({ description: '문의 제목' })
  @IsString()
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  readonly title: string;

  @ApiProperty({ description: '답변 받을 이메일' })
  @IsString()
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  readonly email: string;

  @ApiProperty({ description: '문의 내용' })
  @IsString()
  @IsNotEmpty({ message: '문의 내용은 필수입니다.' })
  @IsByteLength(20, 10000, { message: '문의 내용은 10글자 이상이어야 합니다.' })
  readonly contents: string;
}
