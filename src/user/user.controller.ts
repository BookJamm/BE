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
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { UserExistsValidationPipe } from 'src/global/validation/pipe/user-exists-validation.pipe';
import { ReportUserReqeust } from './dto/reqeust/report-user-request.dto';
import { SignUpRequest } from './dto/reqeust/sign-up-request.dto';
import { ReportUserResponse } from './dto/response/report-user-response.dto';
import { SignUpResponse } from './dto/response/sign-up-response.dto';
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
}
