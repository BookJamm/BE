import { registerAs } from '@nestjs/config';
import { AuthConfig } from './config.type';

export default registerAs<AuthConfig>('auth', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenValidity: process.env.ACCESS_TOKEN_VALIDITY,
  refreshTokenValidity: process.env.REFRESH_TOKEN_VALIDITY,
}));
