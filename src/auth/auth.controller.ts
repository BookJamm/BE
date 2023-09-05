import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/global/base/base-response';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/login-request.dto';
import { LoginResponse } from './dto/login-response.dto';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponse })
  @ApiOperation({ description: '로그인 API' })
  async login(@Body() requst: LoginRequest): Promise<BaseResponse<LoginResponse>> {
    return new BaseResponse(await this.authService.login(requst.email, requst.password));
  }
}
