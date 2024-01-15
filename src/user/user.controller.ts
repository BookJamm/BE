import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { UserExistsValidationPipe } from 'src/global/validation/pipe/user-exists-validation.pipe';
import { FindingPasswordRequest } from './dto/finding-password-request.dto';
import { FindingPasswordResponse } from './dto/finding-password-response.dto';
import { ReportUserReqeust } from './dto/reqeust/report-user-request.dto';
import { SignUpRequest } from './dto/reqeust/sign-up-request.dto';
import { UpdateUserRequest } from './dto/reqeust/update-user-request.dto';
import { ReportUserResponse } from './dto/response/report-user-response.dto';
import { SignUpResponse } from './dto/response/sign-up-response.dto';
import { UpdateUserProfileImageResponse } from './dto/response/update-user-profile-image-response.dto';
import { UpdateUserResponse } from './dto/response/update-user-response.dto';
import { UserConverter } from './user.converter';
import { UserService } from './user.service';

@Controller('api/users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: '이메일 회원 가입',
    description: '이메일을 통한 회원 가입을 진행합니다. ⚠️ multipart/form-data로 보낼 것!',
  })
  @ApiConsumes('multipart/form-data')
  @ApiExtraModels(SignUpRequest)
  @ApiBody({
    schema: {
      allOf: [
        {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              format: 'binary',
            },
          },
        },
        { $ref: getSchemaPath(SignUpRequest) },
      ],
    },
  })
  @ApiCreatedResponse({
    type: SignUpResponse,
    description: '회원가입 성공',
  })
  async signUp(
    @Body() reqeust: SignUpRequest,
    @UploadedFile() profileImage: Express.Multer.File,
  ): Promise<BaseResponse<SignUpResponse>> {
    const newUser = await this.userService.create(reqeust, profileImage);
    return BaseResponse.of(UserConverter.toSignUpResponse(newUser), GlobalResponseCode.CREATED);
  }

  @Post(':targetUserId/report')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '사용자 신고 API',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ReportUserResponse, description: '사용자 신고 성공' })
  async reportUser(
    @Param('targetUserId', UserExistsValidationPipe) userId: number,
    @Body() request: ReportUserReqeust,
    @ExtractPayload() reporterId: number,
  ): Promise<BaseResponse<ReportUserResponse>> {
    const userReport = await this.userService.reportUser(request, reporterId, userId);
    return BaseResponse.of(UserConverter.toReportUserResponse(userReport));
  }

  @Post('finding-password')
  @ApiOperation({
    summary: '이메일로 비밀번호 찾기',
    description: '이메일로 비밀번호 임시 비밀번호를 보냅니다.',
  })
  @ApiOkResponse({ type: FindingPasswordResponse, description: '임시 비밀번호 전송 완료' })
  async findPassword(
    @Body() request: FindingPasswordRequest,
  ): Promise<BaseResponse<FindingPasswordResponse>> {
    const isPasswordSended = await this.userService.findPassword(request);
    return BaseResponse.of(
      UserConverter.toFindingPasswordResponse(isPasswordSended),
      GlobalResponseCode.OK,
    );
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '내 정보 수정 API',
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: UpdateUserResponse })
  async updateUser(
    @ExtractPayload() userId: number,
    @Body() request: UpdateUserRequest,
  ): Promise<BaseResponse<UpdateUserResponse>> {
    const updatedUser = await this.userService.updateUser(userId, request);

    return BaseResponse.of(UserConverter.toUpdateUserResponse(updatedUser));
  }

  @Patch('me/profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: '내 프로필 이미지 수정 API',
    description: '프로필 이미지를 변경합니다. ⚠️ multipart/form-data로 보낼 것!',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        {
          type: 'object',
          properties: {
            image: {
              description: '프로필 이미지, 없다면 기본 이미지로 변경합니다.',
              type: 'string',
              format: 'binary',
            },
          },
        },
      ],
    },
  })
  @ApiOkResponse({ type: UpdateUserProfileImageResponse })
  async updateUserProfileImage(
    @ExtractPayload() userId: number,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const updatedUser = await this.userService.updateUserProfileImage(userId, profileImage);

    return BaseResponse.of(UserConverter.toUpdateUserProfileImageResponse(updatedUser));
  }
}
