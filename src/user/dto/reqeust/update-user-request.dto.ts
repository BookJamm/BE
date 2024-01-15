import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserRequest {
  @ApiProperty({ description: '변경할 닉네임', example: '보노보노' })
  @IsNotEmpty({ message: '닉네임은 필수입니다.' })
  @IsString({ message: '문자열이 아닙니다.' })
  @MinLength(2, { message: '닉네임이 너무 짧습니다. (2글자 이상)' })
  @MaxLength(50, { message: '닉네임이 너무 깁니다. (50글자 이하)' })
  readonly username: string;
}
