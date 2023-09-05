import { Test, TestingModule } from '@nestjs/testing';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController 테스트', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('signUp 테스트 [POST /api/users/sign-up]', () => {
    it('회원 가입 성공', async () => {
      const request = createSignUpRequest();
      const expectedResult = new BaseResponse({ userId: 1 }, GlobalResponseCode.CREATED);
      expect(await usersController.signUp(request)).toStrictEqual(expectedResult);
    });
  });

  const createSignUpRequest = (): SignUpRequest =>
    new SignUpRequest('alex@naver,com', 'password', 'alex');
});
