import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { SignUpResponse } from './dto/sign-up-response.dto';
import { UsersService } from './users.service';

@Controller('api/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  @ApiCreatedResponse({
    type: SignUpResponse,
  })
  @ApiOperation({ description: '회원 가입 API' })
  async signUp(@Body() reqeust: SignUpRequest): Promise<BaseResponse<SignUpResponse>> {
    const newUserId: number = await this.usersService.createUser(await reqeust.toUser());
    return new BaseResponse({ userId: newUserId }, GlobalResponseCode.CREATED);
  }
}
