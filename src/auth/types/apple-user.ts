import * as jwt from 'jsonwebtoken';
import { JwtHeader } from 'jwt-decode';

export type AppleJWTPayload = jwt.JwtPayload & {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  nonce: string;
  c_hash: string;
  email: string;
  email_verified: string;
  is_private_email: string;
  auth_time: number;
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

export type JwtHeaderWithKid = JwtHeader & { kid: string };

export const APPLE_AUTH_TOKEN_URL = 'https://appleid.apple.com/auth/keys';

export const APPLE_ISSUER = 'https://appleid.apple.com';

export const APP_BUNDLE_ID = 'APP_BUNDLE_ID';
