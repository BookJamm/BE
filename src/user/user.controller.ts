import { Body, Controller, Global, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { SignUpResponse } from './dto/sign-up-response.dto';
import { UserConverter } from './user.converter';
import { UserService } from './user.service';
import { FindingPasswordRequest } from './dto/finding-password-request.dto';
import { FindingPasswordResponse } from './dto/finding-password-response.dto';

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
}
