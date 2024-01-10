import {
  Body,
  Controller,
  Param,
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
import { ReportUserResponse } from './dto/response/report-user-response.dto';
import { SignUpResponse } from './dto/response/sign-up-response.dto';
import { UserConverter } from './user.converter';
import { UserService } from './user.service';
import { QuestionResponse } from './dto/response/question-response.dto';
import { QuestionRequest } from './dto/reqeust/question-request.dto';

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

  @Post('question')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '문의 API',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: QuestionResponse, description: '문의 전송 성공' })
  async question(@Body() request: QuestionRequest): Promise<BaseResponse<QuestionResponse>> {
    const isQuestionSended = await this.userService.question(request);
    return BaseResponse.of(UserConverter.toQuestionResponse(isQuestionSended));
  }
}
