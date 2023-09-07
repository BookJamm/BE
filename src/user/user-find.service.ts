import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UserResponseCode } from './exception/user-response-code';

@Injectable()
export class UserFindService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
  async findById(userId: number) {
    try {
      return await this.userRepository.findOneByOrFail({ userId });
    } catch (error) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }
  }
}
