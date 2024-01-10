import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseException } from 'src/global/base/base-exception';
import { MailService } from 'src/global/mail.service';
import { Repository } from 'typeorm';
import { FindingPasswordRequest } from './dto/finding-password-request.dto';
import { ReportUserReqeust } from './dto/reqeust/report-user-request.dto';
import { SignUpRequest } from './dto/reqeust/sign-up-request.dto';
import { Password } from './entity/password';
import { UserReport } from './entity/user-report.entity';
import { User } from './entity/user.entity';
import { UserResponseCode } from './exception/user-response-code';
import { UserConverter } from './user.converter';
import { QuestionRequest } from './dto/reqeust/question-request.dto';
import { Question } from './entity/question.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserReport)
    private readonly userReportRepository: Repository<UserReport>,
    private readonly mailService: MailService,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
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

  async findPassword(request: FindingPasswordRequest): Promise<boolean> {
    try {
      const user: User = await this.userRepository.findOneBy({ email: request.email });
      const password = await this.makeRandomPassword();
      user.password = await Password.encrpyt(password);
      await this.userRepository.save(user);
      await this.sendEmail(request, password);
      return true;
    } catch (error) {
      return false;
    }
  }

  async makeRandomPassword(): Promise<string> {
    const length = Math.floor(10 + Math.random() * 3);
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#%^&*()_+-=[]{}|;\':",./<>?~`\\';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }

  async sendEmail(request: FindingPasswordRequest, password: string): Promise<void> {
    await this.mailService.sendMail(request.email, '[BookJam] 임시 비밀번호 안내', password);
  }

  async question(request: QuestionRequest) {
    return await this.questionRepository.save(request);
  }
}
