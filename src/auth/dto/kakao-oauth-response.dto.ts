import { JwtResponse } from './jwt-response.dto';

export class KakaoOAuthResponse extends JwtResponse {
  readonly isLogin: boolean;
}
