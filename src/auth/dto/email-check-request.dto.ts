import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailCheckRequest {
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  @IsEmail(undefined, { message: '이메일 형식이 아닙니다.' })
  @ApiProperty({ description: '확인할 이메일 주소', example: 'abc@abc.com' })
  email: string;
}
