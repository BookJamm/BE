import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { ActivityService } from './activity.service';
import { ActivityDetailResponse } from './dto/activity-detail-response.dto';
import { ActivityReviewListResponse } from './dto/activity-review-list-response.dto';

@Controller('api/activities')
@UseGuards(JwtAuthGuard)
@ApiTags('activities')
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':activityId')
  @ApiOperation({
    summary: '활동 세부 정보 조회',
    description: '활동 세부 정보를 조회한다. 리뷰는 따로 API 호출 해주세요!',
  })
  @ApiParam({ name: 'activityId', description: '세부 정보를 조회할 활동 아이디' })
  @ApiOkResponse({ type: ActivityDetailResponse })
  async getActivityDetail(
    @ExtractPayload() userId: number,
    @Param('activityId') activityId: number,
  ): Promise<BaseResponse<ActivityDetailResponse>> {
    return new BaseResponse(await this.activityService.getActivityDetail(userId, activityId));
  }

  @Get(':activityId/reviews')
  @ApiOperation({
    summary: '활동 리뷰 조회',
  })
  @ApiParam({ name: 'activityId', description: '리뷰를 조회할 활동 아이디' })
  @ApiQuery({ name: 'last', description: '마지막으로 조회한 리뷰 아이디, 페이징 용' })
  @ApiOkResponse({ type: [ActivityReviewListResponse] })
  async findActivityReviews(
    @ExtractPayload() userId: number,
    @Param('activityId') activityId: number,
    @Query('last') last: number,
  ) {
    return new BaseResponse(
      await this.activityService.findActivityReviews(userId, activityId, last),
    );
  }
}
