import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { ActivityService } from './activity.service';
import { ActivityDetailResponse } from './dto/activity-detail-response.dto';

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
}
