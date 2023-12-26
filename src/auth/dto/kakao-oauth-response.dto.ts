import { ApiProperty } from '@nestjs/swagger';
import { JwtResponse } from './jwt-response.dto';

export class KakaoOAuthResponse extends JwtResponse {
  @ApiProperty({ description: '로그인 여부, true면 회원가입한 것' })
  readonly isLogin: boolean;
}
