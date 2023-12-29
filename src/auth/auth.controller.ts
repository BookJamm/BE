import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseResponse } from 'src/global/base/base-response';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { ExtractToken } from 'src/global/decorator/extract-token.decorator';
import { AuthService } from './auth.service';
import { EmailCheckRequest } from './dto/email-check-request.dto';
import { EmailCheckResponse } from './dto/email-check-response.dto';
import { JwtResponse } from './dto/jwt-response.dto';
import { KakaoOAuthRequest } from './dto/kakao-oauth-request.dto';
import { LoginRequest } from './dto/login-request.dto';
import { JwtAuthGuard } from './guard/auth.guard';
import { AppleOAuthRequest } from './dto/apple-oauth-request.dto';
import { AppleOAuthResponse } from './dto/apple-oauth-response.dto';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT Access Token과 Refresh Token을 발급한다.',
  })
  @ApiOkResponse({ type: JwtResponse, description: '로그인 성공' })
  async login(@Body() requst: LoginRequest): Promise<BaseResponse<JwtResponse>> {
    return new BaseResponse<JwtResponse>(
      await this.authService.login(requst.email, requst.password),
    );
  }

  @Get('reissue')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Access Token 만료시 재발급',
    description: 'Access Token과 Refresh Token을 재발급한다.',
  })
  @ApiBearerAuth()
  @ApiHeaders([{ name: 'Authorization', description: 'Refresh Token' }])
  @ApiOkResponse({ type: JwtResponse, description: '재발급 성공' })
  async reissueToken(
    @ExtractPayload() userId: number,
    @ExtractToken() refreshToken: string,
  ): Promise<BaseResponse<JwtResponse>> {
    return new BaseResponse<JwtResponse>(await this.authService.reissueToken(userId, refreshToken));
  }

  @Post('email-check')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: EmailCheckResponse, description: '중복 확인 성공' })
  @ApiOperation({ summary: '이메일 중복 확인' })
  async checkEmailTaken(
    @Body() reqeust: EmailCheckRequest,
  ): Promise<BaseResponse<EmailCheckResponse>> {
    return new BaseResponse<EmailCheckResponse>({
      availabe: await this.authService.checkEmailTaken(reqeust.email),
    });
  }

  @Post('login/kakao')
  async kakaoOAuth(@Body() request: KakaoOAuthRequest) {
    return this.authService.kakaoOAuth(request.accessToken);
  }

  @Post('login/apple')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AppleOAuthResponse, description: 'Apple 로그인 성공' })
  @ApiOperation({ summary: 'Apple login' })
  async appleOAuth(@Body() request: AppleOAuthRequest): Promise<BaseResponse<AppleOAuthResponse>> {
    return new BaseResponse<AppleOAuthResponse>(
      await this.authService.appleOAuth(request.accessToken),
    );
  }
}
