import { IsNotEmpty, IsString } from 'class-validator';

export class AppleOAuthRequest {
  @IsNotEmpty({ message: '액세스 토큰은 필수입니다.' })
  @IsString({ message: '문자열 형태가 아닙니다.' })
  readonly accessToken: string;
}
