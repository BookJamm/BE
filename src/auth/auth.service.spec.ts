import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import jwtConfig from 'src/global/config/jwt.config';
import { Password } from 'src/users/entities/password';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response.dto';
import { AuthResponseCode } from './exception/auth-respone-code';

describe('AuthService 테스트', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  const userRepositoryToken: string | Function = getRepositoryToken(User);
  const ALEX = {
    email: 'alex@naver.com',
    password: 'password',
    username: 'Alex',
  };
  let user: User;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    user = new User(ALEX.email, await Password.encrpyt(ALEX.password), ALEX.username);
    user.userId = 1;
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({}),
        ConfigModule.forRoot({ load: [jwtConfig], envFilePath: ['.env'] }),
      ],
      providers: [
        AuthService,
        {
          provide: userRepositoryToken,
          useValue: {
            findOne: jest.fn().mockResolvedValue(user),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(userRepositoryToken);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login 테스트', () => {
    it('로그인 성공', async () => {
      const loginResponse: LoginResponse = await authService.login(ALEX.email, ALEX.password);

      expect(jwtService.decode(loginResponse.accessToken)['userId']).toEqual(1);
      expect(jwtService.decode(loginResponse.refreshToken)['userId']).toEqual(1);
    });

    it('이메일이 틀리면 로그인 실패', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const expectedError = BaseException.of(AuthResponseCode.INVALID_LOGIN_REQ);
      await expect(authService.login(ALEX.email, ALEX.password)).rejects.toThrowError(
        expectedError,
      );
    });

    it('비밀번호가 틀리면 로그인 실패', async () => {
      const expectedError = BaseException.of(AuthResponseCode.INVALID_LOGIN_REQ);
      await expect(authService.login(ALEX.email, 'wrong')).rejects.toThrowError(expectedError);
    });
  });
});
