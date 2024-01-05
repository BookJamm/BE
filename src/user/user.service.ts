import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { Repository } from 'typeorm';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { User } from './entity/user.entity';
import { UserConverter } from './user.converter';
import { FindingPasswordRequest } from './dto/finding-password-request.dto';
import { Password } from './entity/password';
import { Builder } from 'builder-pattern';
import { MailSender } from 'src/global/mail-sender';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
    private readonly mailSender: MailSender,
  ) {}

  async create(request: SignUpRequest, profileImage: Express.Multer.File): Promise<User> {
    const newUser = this.userRepository.save(await UserConverter.toUser(request, profileImage));

    return newUser;
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }

  async sendEmail(request: FindingPasswordRequest, password: string): Promise<void> {
    await this.mailSender.sendMail(request.email, '[BookJam] 임시 비밀번호 안내', password);
  }
}
