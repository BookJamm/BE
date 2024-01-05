import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsEmailExist } from 'src/global/validation/decorator/is-email-exist.decorator';

export class FindingPasswordRequest {
  @IsEmail({}, { message: '이메일 형식이 아닙니다' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  @IsEmailExist({ message: '존재하지 않는 유저입니다.' })
  readonly email: string;
}
