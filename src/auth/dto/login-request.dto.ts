import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Password } from 'src/user/entity/password';

export class LoginRequest {
  @ApiProperty({ example: 'abc@abc.com', description: '이메일' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  @IsEmail(undefined, { message: '이메일 형식이 아닙니다.' })
  readonly email: string;

  @ApiProperty({ example: 'password123!', description: '비밀번호' })
  @IsNotEmpty({ message: '비밀버호는 필수입니다.' })
  @Matches(Password.PASSWORD_PATTERN, { message: '비밀번호 형식이 아닙니다.' })
  readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
