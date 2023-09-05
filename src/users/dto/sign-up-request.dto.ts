import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Password } from '../entities/password';
import { User } from '../entities/user.entity';

export class SignUpRequest {
  @ApiProperty({
    description: '이메일',
    example: 'abc@abc.com',
  })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  readonly email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'Password123!',
  })
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  @IsString({ message: '비밀번호 형식이 아닙니다.' })
  @Matches(Password.PASSWORD_PATTERN, { message: '비밀번호 형식이 아닙니다.' })
  readonly password: string;

  @ApiProperty({
    description: '닉네임',
    example: '보노',
  })
  @IsNotEmpty({ message: '닉네임은 필수입니다.' })
  @IsString({ message: '올바른 닉네임 형식이 아닙니다.' })
  readonly username: string;

  constructor(email: string, password: string, username: string) {
    this.email = email;
    this.password = password;
    this.username = username;
  }

  public async toUser(): Promise<User> {
    return User.createUser(this.email, await Password.encrpyt(this.password), this.username);
  }
}
