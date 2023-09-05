import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/login-request.dto';

describe('AuthController 테스트', () => {
  let authController: AuthController;
  const accessToken: string =
    'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaWF0IjoxNjc3OTM3MjI0LCJleHAiOjE2Nzc5NDQ0MjR9.t61tw4gDEBuXBn_DnCwiPIDaI-KcN9Zkn3QJSEK7fag';
  const refreshToken: string =
    'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaWF0IjoxNjc3OTM3MjI0LCJleHAiOjE2Nzg1NDIwMjR9.doqGa5Hcq6chjER1y5brJEv81z0njcJqeYxJb159ZX4';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ accessToken, refreshToken }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signIn 테스트 [POST /api/auth/login]', () => {
    it('로그인 성공', async () => {
      const request: LoginRequest = createLoginRequst();
      const expectedResult = new BaseResponse({ accessToken, refreshToken }, GlobalResponseCode.OK);
      expect(await authController.login(request)).toStrictEqual(expectedResult);
    });
  });

  const createLoginRequst = () => new LoginRequest('alex@naver.com', 'password');
});
