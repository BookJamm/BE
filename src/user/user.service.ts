import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { MailService } from 'src/global/mail.service';
import { Repository } from 'typeorm';
import { FindingPasswordRequest } from './dto/finding-password-request.dto';
import { ReportUserReqeust } from './dto/reqeust/report-user-request.dto';
import { SignUpRequest } from './dto/reqeust/sign-up-request.dto';
import { UpdateUserRequest } from './dto/reqeust/update-user-request.dto';
import { Password } from './entity/password';
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
    private readonly mailService: MailService,
    private readonly s3Service: S3Service,
  ) {}

  async isUserExists(userId: number): Promise<boolean> {
    return this.userRepository.exist({ where: { userId } });
  }

  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }

    return user;
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

  async updateUser(userId: number, request: UpdateUserRequest): Promise<User> {
    const user = await this.userRepository.findOneBy({ userId });

    const updatedUser = UserConverter.toUpdateUser(user, request);

    return this.userRepository.save(updatedUser);
  }

  async updateUserProfileImage(userId: number, image: Express.Multer.File) {
    const user = await this.userRepository.findOneBy({ userId });

    if (user.profileImage !== '') {
      await this.s3Service.deleteFileByUrl(user.profileImage);
    }

    user.profileImage = image ? await this.s3Service.uploadProfileImageFile(image) : '';

    return await this.userRepository.save(user);
  }
}
