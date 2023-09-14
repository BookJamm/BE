import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { FollowResponse } from './dto/follow-response.dto';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { SignUpResponse } from './dto/sign-up-response.dto';
import { UserResponse } from './dto/user-response.dto';
import { UserService } from './user.service';

@Controller('api/users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 검색',
    description:
      '실명, 닉네임, 이메일(@ 앞부분) 대상으로 하여 검색하여 10개씩 조회한다. 타이핑 할 때마다(자모음 단위) 검색 가능',
  })
  @ApiQuery({ name: 'keyword', description: '검색 키워드' })
  @ApiQuery({ name: 'last', description: '마지막으로 본 사용자의 아이디 (페이징 용)' })
  @ApiOkResponse({ type: [UserResponse] })
  async findUsersByKeyword(
    @ExtractPayload() userId: number,
    @Query('keyword') keyword: string,
    @Query('last') last: number,
  ) {
    return new BaseResponse(await this.userService.findByKeyword(userId, keyword, last));
  }

  @Get('friends/recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 추천',
    description: '사용자 3명을 랜덤으로 추천한다.',
  })
  @ApiOkResponse({ type: [UserResponse] })
  async recommendFriends(): Promise<BaseResponse<UserResponse[]>> {
    return new BaseResponse<UserResponse[]>(await this.userService.recommnedFriends());
  }

  @Post('sign-up')
  @ApiCreatedResponse({
    type: SignUpResponse,
    description: '회원가입 성공',
  })
  @ApiOperation({ summary: '회원 가입' })
  async signUp(@Body() reqeust: SignUpRequest): Promise<BaseResponse<SignUpResponse>> {
    const newUserId: number = await this.userService.create(await reqeust.toUser());
    return new BaseResponse({ userId: newUserId }, GlobalResponseCode.CREATED);
  }

  @Post('friends/:targetUserId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '친구 추가/친구 삭제',
    description: '친구로 추가되어 있지않으면 추가, 추가되어 있으면 삭제',
  })
  @ApiCreatedResponse({
    type: FollowResponse,
  })
  @ApiParam({ name: 'targetUserId', description: '친구 추가/삭제할 사용자의 아이디' })
  @ApiBearerAuth()
  async follow(
    @ExtractPayload() userId: number,
    @Param('targetUserId') targetUserId: number,
  ): Promise<BaseResponse<FollowResponse>> {
    return new BaseResponse<FollowResponse>(
      await this.userService.follow(userId, targetUserId),
      GlobalResponseCode.CREATED,
    );
  }
}
