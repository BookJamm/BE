import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController 테스트', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('signUp 테스트 [POST /api/users/sign-up]', () => {
    it('회원 가입 성공', async () => {
      const request = createSignUpRequest();
      const expectedResult = new BaseResponse({ userId: 1 }, GlobalResponseCode.CREATED);
      expect(await userController.signUp(request)).toStrictEqual(expectedResult);
    });
  });

  const createSignUpRequest = (): SignUpRequest =>
    new SignUpRequest('alex@naver,com', 'password', 'alex');
});
