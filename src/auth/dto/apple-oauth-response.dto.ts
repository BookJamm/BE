import { JwtResponse } from './jwt-response.dto';

export class AppleOAuthResponse extends JwtResponse {
  readonly isLogin: boolean;
}
