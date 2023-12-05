import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KakaoOAuthRequest {
  @IsNotEmpty({ message: '액세스 토큰은 필수입니다.' })
  @IsString({ message: '문자열 형태가 아닙니다.' })
  @ApiProperty({ description: '카카오 Access Token' })
  readonly accessToken: string;
}
