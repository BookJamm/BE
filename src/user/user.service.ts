import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRegExp } from 'korean-regexp';
import { BaseException } from 'src/global/base/base-exception';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { Repository } from 'typeorm';
import { UserResponse } from './dto/user-response.dto';
import { Follow } from './entity/follow.entity';
import { User } from './entity/user.entity';
import { UserRepository } from './entity/user.repository';
import { UserResponseCode } from './exception/user-response-code';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async create(user: User): Promise<number> {
    const newUser = await this.userRepository.save(user);

    return newUser.userId;
  }

  async follow(userId: number, targetUserId: number) {
    if (userId === targetUserId) {
      throw BaseException.of(UserResponseCode.FOLLOW_MYSELF);
    }

    const user = await this.userRepository.findOneBy({ userId });
    const targetUser = await this.userRepository.findOneBy({ userId: targetUserId });

    if (!(user && targetUser)) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }

    const follow = await this.followRepository.findOneBy({
      follower: { userId },
      followee: { userId: targetUserId },
    });

    let following: boolean;
    if (follow) {
      await this.followRepository.remove(follow);
      following = false;
    } else {
      const newFollow = new Follow(user, targetUser);
      await this.followRepository.save(newFollow);
      following = true;
    }

    return { following };
  }

  async findByKeyword(userId: number, keyword: string, last: number): Promise<UserResponse[]> {
    if (!keyword) {
      throw BaseException.of(GlobalResponseCode.EMPTY_KEYWORD);
    }

    const keywordRegExp = getRegExp(keyword).toString().slice(1, -2);

    const users = await this.userRepository.findByKeyword(userId, keywordRegExp, last);

    await Promise.all(
      users.map(async user => {
        const { userId: searchedUserId } = user;
        user.following = await this.getFollowing(userId, searchedUserId);
      }),
    );

    return users;
  }

  async recommnedFriends(): Promise<UserResponse[]> {
    return await this.userRepository.findOrderByRandom();
  }

  async getFollowing(userId: number, targetUserId: number) {
    if (userId === targetUserId) {
      return null;
    }

    return await this.followRepository.exist({
      where: { follower: { userId }, followee: { userId: targetUserId } },
    });
  }
}
