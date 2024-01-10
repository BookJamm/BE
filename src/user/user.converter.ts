import { Injectable, OnModuleInit } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { S3Service } from 'src/aws/s3/s3.service';
import { FindingPasswordResponse } from './dto/finding-password-response.dto';
import { ReportUserReqeust } from './dto/reqeust/report-user-request.dto';
import { SignUpRequest } from './dto/reqeust/sign-up-request.dto';
import { ReportUserResponse } from './dto/response/report-user-response.dto';
import { SignUpResponse } from './dto/response/sign-up-response.dto';
import { Password } from './entity/password';
import { UserReport } from './entity/user-report.entity';
import { User } from './entity/user.entity';
import { UserReportReason } from './enum/user-report-reason';
import { QuestionResponse } from './dto/response/question-response.dto';
import { Question } from './entity/question.entity';

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

  public static toUserReport(reqeust: ReportUserReqeust, reporter: User, targetUser: User) {
    return Builder(UserReport)
      .reason(UserReportReason[reqeust.reason])
      .reporter(reporter)
      .targetUser(targetUser)
      .build();
  }

  public static toReportUserResponse(userReport: UserReport) {
    return Builder(ReportUserResponse)
      .reportedAt(userReport.createdAt)
      .reportedUserId(userReport.reporter.userId)
      .build();
  }

  public static toFindingPasswordResponse(isPasswordSended: boolean): FindingPasswordResponse {
    return Builder(FindingPasswordResponse).isPasswordSended(isPasswordSended).build();
  }

  public static toQuestionResponse(question: Question): QuestionResponse {
    return Builder(QuestionResponse)
      .isSended(question ? true : false)
      .build();
  }
}
