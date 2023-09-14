import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { UserResponse } from '../dto/user-response.dto';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findByKeyword(userId: number, keyword: string, last: number): Promise<UserResponse[]> {
    const qb = this.repository.createQueryBuilder('u');

    qb.select([
      'u.user_id userId',
      'u.profile_image profileImage',
      'u.username username',
      'u.email email',
    ])
      .where(`u.username regexp '${keyword}'`)
      .orWhere(`substring_index(u.email, '@', 1) regexp '${keyword}'`)
      .orWhere(`name regexp '${keyword}'`)
      .andWhere(`u.user_id != '${userId}'`)
      .orderBy(`u.user_id`, 'DESC')
      .take(10);

    if (last) {
      qb.andWhere(`u.user_id < ${last}`);
    }

    return plainToInstance(UserResponse, await qb.getRawMany());
  }

  async findOrderByRandom(): Promise<UserResponse[]> {
    const qb = this.repository.createQueryBuilder('u');

    qb.select([
      'u.user_id userId',
      'u.profile_image profileImage',
      'u.username username',
      'u.email email',
    ])
      .orderBy('rand()')
      .take(3);

    return plainToInstance(UserResponse, await qb.getRawMany());
  }
}
