import { ApiProperty } from '@nestjs/swagger';

export class QuestionResponse {
  @ApiProperty({ description: '문의 전달 여부', example: true })
  isSended: boolean;
}
