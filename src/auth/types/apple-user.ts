import * as jwt from 'jsonwebtoken';

export type AppleJWTPayload = jwt.JwtPayload & {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  nonce: string;
  nonce_supported: boolean;
  email: string;
  email_verified: string;
  is_private_email: string;
  real_user_status: number;
  transfer_sub: string;
};

export type AppleAuthKeys = {
  keys: {
    kty: string;
    alg: string;
    use: string;
    kid: string;
    n: string;
    e: string;
  }[];
};

export const APPLE_AUTH_TOKEN_URL = 'https://appleid.apple.com/auth/keys';

export const APPLE_ISSUER = 'https://appleid.apple.com';

export const APP_BUNDLE_ID = 'APP_BUNDLE_ID';
