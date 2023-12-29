import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { SignUpResponse } from './dto/sign-up-response.dto';
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
    const newUserId: number = await this.userService.create(await reqeust.toUser(), profileImage);
    return BaseResponse.of({ userId: newUserId }, GlobalResponseCode.CREATED);
  }
}
