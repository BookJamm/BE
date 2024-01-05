import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { PlaceReviewExistsValidationPipe } from 'src/global/validation/pipe/place-review-exists-validation.pipe';
import { DeleteReviewResponse } from './dto/response/delete-review-response.dto';
import { PlaceReviewService } from './place-review.service';

@Controller('api/place-reviews')
@UseGuards(JwtAuthGuard)
@ApiTags('place reviews')
@ApiBearerAuth()
export class PlaceReviewController {
  constructor(private readonly placeReviewService: PlaceReviewService) {}

  @Delete(':targetReviewId')
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiParam({ name: 'targetReviewId', description: '삭제할 리뷰의 아이디' })
  @ApiOkResponse({ type: DeleteReviewResponse, description: '리뷰 삭제 성공' })
  async delete(
    @ExtractPayload() userId: number,
    @Param('targetReviewId', PlaceReviewExistsValidationPipe) targetReviewId: number,
  ): Promise<BaseResponse<DeleteReviewResponse>> {
    this.placeReviewService.delete(userId, targetReviewId);
    return BaseResponse.of({ deleted: true });
  }
}
