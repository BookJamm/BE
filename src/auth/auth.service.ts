import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { Password } from 'src/user/entity/password';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { LoginResponse } from './dto/login-response.dto';
import { AuthResponseCode } from './exception/auth-respone-code';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw BaseException.of(AuthResponseCode.INVALID_LOGIN_REQ);
    }

    if (!(await this.validatePassword(password, user.password))) {
      throw BaseException.of(AuthResponseCode.INVALID_LOGIN_REQ);
    }

    const secret = this.configService.get('auth.secret', { infer: true });

    const accessTokenValidity = this.configService.get('auth.accessTokenValidity', { infer: true });
    const refreshTokenValidity = this.configService.get('auth.refreshTokenValidity', {
      infer: true,
    });

    const accessToken = await this.jwtService.signAsync(
      { userId: user.userId },
      {
        secret,
        expiresIn: accessTokenValidity,
        issuer: 'bookjam',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        userId: user.userId,
      },
      {
        secret,
        expiresIn: refreshTokenValidity,
        issuer: 'bookjam',
      },
    );

    user.refreshToken = refreshToken;

    await this.userRepository.update(user.userId, { refreshToken });

    return { accessToken, refreshToken };
  }

  private async validatePassword(
    comparePassword: string,
    savedPassword: Password,
  ): Promise<boolean> {
    return savedPassword.isSamePassword(comparePassword);
  }
}
