import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Password } from './entity/password';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

let newUser: User;

describe('UserService 테스트', () => {
  let userService: UserService;
  const userRepositoryToken = getRepositoryToken(User);

  beforeEach(async () => {
    newUser = new User('alex@naver.com', await Password.encrpyt('password'), 'alex');
    newUser.userId = 1;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: userRepositoryToken,
          useValue: {
            save: jest.fn().mockResolvedValue(newUser),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('signUp 테스트', () => {
    it('회원 가입에 성공', async () => {
      const newUserId = await userService.createUser(newUser);
      expect(newUserId).toEqual(1);
    });
  });
});
