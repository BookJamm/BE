import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { Repository } from 'typeorm';
import { Follow } from './entity/follow.entity';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
  ) {}

  async create(user: User, profileImage: Express.Multer.File): Promise<number> {
    if (profileImage) {
      const url = await this.s3Service.uploadProfileImageFile(profileImage);
      user.profileImage = url;
    }

    const newUser = await this.userRepository.save(user);

    return newUser.userId;
  }

  async getFollowing(userId: number, targetUserId: number) {
    if (!userId || userId === targetUserId) {
      return null;
    }

    return await this.followRepository.exist({
      where: { follower: { userId }, followee: { userId: targetUserId } },
    });
  }
}
