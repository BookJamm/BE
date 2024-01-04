import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { Repository } from 'typeorm';
import { ReportUserReqeust } from './dto/reqeust/report-user-request.dto';
import { SignUpRequest } from './dto/reqeust/sign-up-request.dto';
import { UserReport } from './entity/user-report.entity';
import { User } from './entity/user.entity';
import { UserResponseCode } from './exception/user-response-code';
import { UserConverter } from './user.converter';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserReport)
    private readonly userReportRepository: Repository<UserReport>,
  ) {}

  async isUserExists(userId: number): Promise<boolean> {
    return this.userRepository.exist({ where: { userId } });
  }

  async create(request: SignUpRequest, profileImage: Express.Multer.File): Promise<User> {
    const newUser = this.userRepository.save(await UserConverter.toUser(request, profileImage));

    return newUser;
  }

  async reportUser(
    request: ReportUserReqeust,
    reporterId: number,
    targetUserId: number,
  ): Promise<UserReport> {
    if (reporterId === targetUserId) {
      throw BaseException.of(UserResponseCode.REPORT_SELF);
    }

    const isAlreadyReported = await this.userReportRepository.exist({
      where: { reporter: { userId: reporterId }, targetUser: { userId: targetUserId } },
    });
    if (isAlreadyReported) {
      throw BaseException.of(UserResponseCode.ALREADY_REPORTED);
    }

    const reporter = await this.userRepository.findOneBy({ userId: reporterId });
    const targetUser = await this.userRepository.findOneBy({ userId: targetUserId });

    const userReport = UserConverter.toUserReport(request, reporter, targetUser);

    return await this.userReportRepository.save(userReport);
  }
}
