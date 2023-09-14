import { Password } from 'src/user/entity/password';
import { User } from 'src/user/entity/user.entity';

export const UserFixture = {
  toUser: async (email: string, password: string, username: string) => {
    return new User(email, await Password.encrpyt(password), username);
  },
  USER_01: {
    username: 'Alex',
    email: 'alex@naver.com',
    password: 'password123',
  },
};
