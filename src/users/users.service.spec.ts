import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Password } from './entities/password';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

let newUser: User;

describe('UsersService 테스트', () => {
  let usersService: UsersService;
  const userRepositoryToken: string | Function = getRepositoryToken(User);

  beforeEach(async () => {
    newUser = new User('alex@naver.com', await Password.encrpyt('password'), 'alex');
    newUser.userId = 1;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: userRepositoryToken,
          useValue: {
            save: jest.fn().mockResolvedValue(newUser),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('signUp 테스트', () => {
    it('회원 가입에 성공', async () => {
      const newUserId = await usersService.createUser(newUser);
      expect(newUserId).toEqual(1);
    });
  });
});
