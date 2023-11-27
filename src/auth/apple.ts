import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import jwtDecode, { JwtHeader } from 'jwt-decode';

/**
 * @see {@link https://github.com/expo/expo/blob/sdk-44/packages/expo-apple-authentication/src/AppleAuthentication.types.ts#L147}
 * An object representing the tokenized portions of the user's full name. Any of all of the fields
 * may be `null`. Only applicable fields that the user has allowed your app to access will be nonnull.
 */
export type AppleAuthenticationFullName = {
  namePrefix: string | null;
  givenName: string | null;
  middleName: string | null;
  familyName: string | null;
  nameSuffix: string | null;
  nickname: string | null;
};

enum AppleAuthenticationUserDetectionStatus {
  /**
   * The system does not support this determination and there is no data.
   */
  UNSUPPORTED = 0,
  /**
   * The system has not determined whether the user might be a real person.
   */
  UNKNOWN = 1,
  /**
   * The user appears to be a real person.
   */
  LIKELY_REAL = 2,
}

/**
 * The object type returned from a successful call to [`AppleAuthentication.signInAsync()`](#appleauthenticationsigninasyncoptions),
 * [`AppleAuthentication.refreshAsync()`](#appleauthenticationrefreshasyncoptions), or [`AppleAuthentication.signOutAsync()`](#appleauthenticationsignoutasyncoptions)
 * which contains all of the pertinent user and credential information.
 *
 * @see {@link https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidcredential | Apple Documentation}
 * for more details.
 */
export type AppleAuthenticationCredential = {
  /**
   * An identifier associated with the authenticated user. You can use this to check if the user is
   * still authenticated later. This is stable and can be shared across apps released under the same
   * development team. The same user will have a different identifier for apps released by other
   * developers.
   */
  user: string;

  /**
   * An arbitrary string that your app provided as `state` in the request that generated the
   * credential. Used to verify that the response was from the request you made. Can be used to
   * avoid replay attacks. If you did not provide `state` when making the sign-in request, this field
   * will be `null`.
   */
  state: string | null;

  /**
   * The user's name. May be `null` or contain `null` values if you didn't request the `FULL_NAME`
   * scope, if the user denied access, or if this is not the first time the user has signed into
   * your app.
   */
  fullName: AppleAuthenticationFullName | null;

  /**
   * The user's email address. Might not be present if you didn't request the `EMAIL` scope. May
   * also be null if this is not the first time the user has signed into your app. If the user chose
   * to withhold their email address, this field will instead contain an obscured email address with
   * an Apple domain.
   */
  email: string | null;

  /**
   * A value that indicates whether the user appears to the system to be a real person.
   */
  realUserStatus: AppleAuthenticationUserDetectionStatus;

  /**
   * A JSON Web Token (JWT) that securely communicates information about the user to your app.
   */
  identityToken: string | null;

  /**
   * A short-lived session token used by your app for proof of authorization when interacting with
   * the app's server counterpart. Unlike `user`, this is ephemeral and will change each session.
   */
  authorizationCode: string | null;
};

/** @see https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/authenticating_users_with_sign_in_with_apple */
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

/** @see https://developer.apple.com/documentation/sign_in_with_apple/fetch_apple_s_public_key_for_verifying_token_signature */
type AppleAuthKeys = {
  keys: {
    kty: string;
    alg: string;
    use: string;
    kid: string;
    n: string;
    e: string;
  }[];
};

type JwtHeaderWithKid = JwtHeader & { kid: string };

/**
 * @see https://developer.apple.com/documentation/sign_in_with_apple/fetch_apple_s_public_key_for_verifying_token_signature
 * > select the key with the matching key identifier (kid) to verify the signature of any JSON Web Token (JWT)
 */
const APPLE_AUTH_TOKEN_URL = 'https://appleid.apple.com/auth/keys';

/** @see https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api */
const APPLE_ISSUER = 'https://appleid.apple.com';

/** Your apple bundle id */
const YOUR_APP_BUNDLE_ID = 'YOUR_APP_BUNDLE_ID';

/**
 * Verify and decode JWT.
 * @param token 'Sign in with Apple' JWT
 * @returns Decoded JWT payload
 */
async function verifyAndDecodeJWT(token: string): Promise<AppleJWTPayload> {
  try {
    const tokenDecodedHeader = jwtDecode<JwtHeaderWithKid>(token, {
      header: true,
    });

    const { data: applePublicKey } = await axios.get<AppleAuthKeys>(APPLE_AUTH_TOKEN_URL);

    const client = jwksClient({
      jwksUri: APPLE_AUTH_TOKEN_URL,
    });

    const sharedKid = applePublicKey.keys.find(key => key.kid === tokenDecodedHeader.kid)?.kid;
    const key = await client.getSigningKey(sharedKid);
    const signingKey = key.getPublicKey(); // rsa public key
    const payload = <AppleJWTPayload>jwt.verify(token, signingKey);
    validateAppleToken(payload);
    return payload;
  } catch (error) {
    console.error({ error });
  }
}

/**
 * Validate jwt payload.
 * @param payload Apple jwt payload
 */
function validateAppleToken(payload: AppleJWTPayload): void {
  if (payload.iss !== APPLE_ISSUER) {
    const message = 'Issuers do not match!';
    console.error({ error: new Error(message) });
  }
  if (payload.aud !== YOUR_APP_BUNDLE_ID) {
    const message = 'Audiences do not match!';
    console.error({ error: new Error(message) });
  }
}

/**
 * Process data from 'Sign with in Apple'
 *  - verify jwt
 *  - validate from apple public key
 *  - decode and return payload includes email
 * @param args - Data after pressed 'Sign in with Apple' button.
 * @returns jwt payload includes email.
 *
 */
async function main(args: AppleAuthenticationCredential) {
  const payload = verifyAndDecodeJWT(args.identityToken);
  return payload;
}
