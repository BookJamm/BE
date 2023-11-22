import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { Password } from 'src/user/entity/password';
import { User } from 'src/user/entity/user.entity';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { Repository } from 'typeorm';
import { JwtResponse } from './dto/jwt-response.dto';
import { AuthResponseCode } from './exception/auth-respone-code';

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

  private async generateAccessToken(userId: number) {
    const secret = this.configService.get('auth.secret', { infer: true });
    const accessTokenValidity = this.configService.get('auth.accessTokenValidity', { infer: true });

    return await this.jwtService.signAsync(
      { userId },
      {
        secret,
        expiresIn: accessTokenValidity,
        issuer: 'bookjam',
      },
    );
  }

  private async generateRefreshToken(userId: number) {
    const secret = this.configService.get('auth.secret', { infer: true });
    const refreshTokenValidity = this.configService.get('auth.refreshTokenValidity', {
      infer: true,
    });

    return await this.jwtService.signAsync(
      {
        userId: userId,
      },
      {
        secret,
        expiresIn: refreshTokenValidity,
        issuer: 'bookjam',
      },
    );
  }

  async checkEmailTaken(email: string) {
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
}
