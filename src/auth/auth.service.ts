import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Builder } from 'builder-pattern';
import { BaseException } from 'src/global/base/base-exception';
import { Password } from 'src/user/entity/password';
import { User } from 'src/user/entity/user.entity';
import { SocialType } from 'src/user/enum/social-type';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { ObjectId, Repository } from 'typeorm';
import { JwtResponse } from './dto/jwt-response.dto';
import { KakaoOAuthResponse } from './dto/kakao-oauth-response.dto';
import { AuthResponseCode } from './exception/auth-respone-code';
import { JwtClaim } from './types/jwt-claim';
import { KakaoUser } from './types/kakao-user';
import { AppleOAuthResponse } from './dto/apple-oauth-response.dto';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { JwtHeader, jwtDecode } from 'jwt-decode';
import {
  APPLE_AUTH_TOKEN_URL,
  APPLE_ISSUER,
  AppleAuthKeys,
  AppleJWTPayload,
  APP_BUNDLE_ID,
} from './types/apple-user';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<JwtResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw BaseException.of(AuthResponseCode.INVALID_LOGIN_REQ);
    }

    if (!(await this.validatePassword(password, user.password))) {
      throw BaseException.of(AuthResponseCode.INVALID_LOGIN_REQ);
    }

    const accessToken = await this.generateAccessToken(user.userId);
    const refreshToken = await this.generateRefreshToken(user.userId);

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  private async validatePassword(
    comparePassword: string,
    savedPassword: Password,
  ): Promise<boolean> {
    return savedPassword.isSamePassword(comparePassword);
  }

  private async generateAccessToken(userId: number, socialType?: string, socialId?: string) {
    const secret = this.configService.get('auth.secret', { infer: true });
    const accessTokenValidity = this.configService.get('auth.accessTokenValidity', { infer: true });

    const claims: Partial<JwtClaim> = { sub: userId };
    if (socialType && socialId) {
      claims.socialId = socialId;
      claims.socialType = socialType;
    }

    return await this.jwtService.signAsync(claims, {
      secret,
      expiresIn: accessTokenValidity,
      issuer: 'bookjam',
    });
  }

  private async generateRefreshToken(userId: number, socialType?: string, socialId?: string) {
    const secret = this.configService.get('auth.secret', { infer: true });
    const refreshTokenValidity = this.configService.get('auth.refreshTokenValidity', {
      infer: true,
    });

    const claims: Partial<JwtClaim> = { sub: userId };
    if (socialType && socialId) {
      claims.socialId = socialId;
      claims.socialType = socialType;
    }

    return await this.jwtService.signAsync(claims, {
      secret,
      expiresIn: refreshTokenValidity,
      issuer: 'bookjam',
    });
  }

  async isEmailAvailable(email: string) {
    return !(await this.userRepository.exist({ where: { email } }));
  }

  async reissueToken(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }

    if (user.refreshToken !== refreshToken) {
      throw BaseException.of(AuthResponseCode.INVALID_TOKEN);
    }

    const newAccessToken = await this.generateAccessToken(userId);
    const newRefreshToken = await this.generateRefreshToken(userId);

    user.refreshToken = newRefreshToken;
    await this.userRepository.save(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async kakaoOAuth(kakaoAccessToken: string): Promise<KakaoOAuthResponse> {
    const socialType = SocialType.KAKAO;
    let isLogin = true;

    const kakaoUser = await this.getKakaoUserByAccessToken(kakaoAccessToken);
    const socialId = kakaoUser.id.toString();

    let user = await this.userRepository.findOneBy({ socialId, socialType });

    let accessToken = '';
    let refreshToken = '';

    if (!user) {
      isLogin = false;

      accessToken = await this.generateAccessToken(
        user.userId,
        Object.values(SocialType)[socialType],
        user.socialId,
      );
      refreshToken = await this.generateRefreshToken(
        user.userId,
        Object.values(SocialType)[socialType],
        user.socialId,
      );

      user = await this.userRepository.save(
        Builder(User)
          .socialId(socialId)
          .socialType(socialType)
          .username(kakaoUser.kakao_account.profile.nickname)
          .profileImage(kakaoUser.kakao_account.profile.profile_image_url)
          .refreshToken(refreshToken)
          .build(),
      );
    } else {
      isLogin = true;

      accessToken = await this.generateAccessToken(
        user.userId,
        Object.values(SocialType)[socialType],
        user.socialId,
      );
      refreshToken = await this.generateRefreshToken(
        user.userId,
        Object.values(SocialType)[socialType],
        user.socialId,
      );
    }

    return Builder(KakaoOAuthResponse)
      .isLogin(isLogin)
      .accessToken(accessToken)
      .refreshToken(refreshToken)
      .build();
  }

  private async getKakaoUserByAccessToken(accessToken: string): Promise<KakaoUser> {
    const KAKAO_USER_REQUEST_URL = 'https://kapi.kakao.com/v2/user/me';

    let user: KakaoUser;
    try {
      const { data } = await axios.get<KakaoUser>(KAKAO_USER_REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      user = data;
    } catch (error) {
      throw BaseException.of(AuthResponseCode.KAKAO_REQUEST_FAILED);
    }

    if (!user) {
      throw BaseException.of(AuthResponseCode.INVALID_TOKEN);
    }

    return user;
  }

  async appleOAuth(appleAccessToken: string): Promise<AppleOAuthResponse> {
    const socialType = SocialType.APPLE;
    let isLogin = true;

    const appleUser = await this.getAppleUserByAccessToken(appleAccessToken);
    const socialId = appleUser.sub;
    const socialEmail = appleUser.email;

    let user = await this.userRepository.findOneBy({ socialId, socialType });

    let accessToken = '';
    let refreshToken = '';

    if (!user) {
      isLogin = false;

      user = await this.userRepository.save(
        Builder(User)
          .email(socialEmail)
          .socialId(socialId)
          .socialType(socialType)
          .username(socialEmail.split('@')[0])
          .refreshToken(refreshToken)
          .build(),
      );
    } else {
      isLogin = true;
    }

    accessToken = await this.generateAccessToken(
      user.userId,
      Object.values(SocialType)[socialType],
      user.socialId,
    );

    refreshToken = await this.generateRefreshToken(
      user.userId,
      Object.values(SocialType)[socialType],
      user.socialId,
    );

    user.refreshToken = refreshToken;
    // refresh token 새로 발급 했으니 user table에 update
    await this.userRepository.update(user.userId, user);

    return Builder(AppleOAuthResponse)
      .isLogin(isLogin)
      .accessToken(accessToken)
      .refreshToken(refreshToken)
      .build();
  }

  private async getAppleUserByAccessToken(accessToken: string): Promise<AppleJWTPayload> {
    try {
      const tokenDecodedHeader = jwtDecode<JwtHeader>(accessToken, {
        header: true,
      });

      const { data: applePublicKey } = await axios.get<AppleAuthKeys>(APPLE_AUTH_TOKEN_URL);

      const client = jwksClient({
        jwksUri: APPLE_AUTH_TOKEN_URL,
      });

      const sharedKid = applePublicKey.keys.find(
        key => key.kid === tokenDecodedHeader.kid && key.alg === tokenDecodedHeader.alg,
      )?.kid;
      const key = await client.getSigningKey(sharedKid);
      const signingKey = key.getPublicKey(); // rsa public key
      const payload = <AppleJWTPayload>jwt.verify(accessToken, signingKey);
      this.validateAppleToken(payload);
      return payload;
    } catch (error) {
      throw BaseException.of(AuthResponseCode.APPLE_REQUEST_FAILED);
    }
  }

  async validateAppleToken(payload: AppleJWTPayload) {
    if (payload.iss !== APPLE_ISSUER) {
      throw BaseException.of(AuthResponseCode.INVALID_APPLE_ISSUER);
    }
    if (payload.aud !== APP_BUNDLE_ID) {
      throw BaseException.of(AuthResponseCode.INVALID_APPLE_AUDIENCE);
    }
  }
}
