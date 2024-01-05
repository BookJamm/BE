import { Injectable, OnModuleInit } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { S3Service } from 'src/aws/s3/s3.service';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { SignUpResponse } from './dto/sign-up-response.dto';
import { Password } from './entity/password';
import { User } from './entity/user.entity';
import { FindingPasswordResponse } from './dto/finding-password-response.dto';

@Injectable()
export class UserConverter implements OnModuleInit {
  private static staticS3Service: S3Service;
  constructor(private readonly s3Service: S3Service) {}
  onModuleInit() {
    UserConverter.staticS3Service = this.s3Service;
  }
  public static async toUser(
    request: SignUpRequest,
    profileImage: Express.Multer.File,
  ): Promise<User> {
    const user = Builder(User)
      .email(request.email)
      .password(await Password.encrpyt(request.password))
      .username(request.username)
      .build();

    if (profileImage) {
      user.profileImage = await this.staticS3Service.uploadProfileImageFile(profileImage);
    }

    return user;
  }

  public static toSignUpResponse(user: User): SignUpResponse {
    return Builder(SignUpResponse).userId(user.userId).build();
  }

  public static toFindingPasswordResponse(isPasswordSended: boolean): FindingPasswordResponse {
    return Builder(FindingPasswordResponse).isPasswordSended(isPasswordSended).build();
  }
}
