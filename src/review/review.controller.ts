import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { DeleteReviewResponse } from './dto/delete-review-response.dto';
import { ReviewService } from './review.service';

@Controller('api/reviews')
@UseGuards(JwtAuthGuard)
@ApiTags('reviews')
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Delete(':targetReviewId')
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiParam({ name: 'targetReviewId', description: '삭제할 리뷰의 아이디' })
  @ApiOkResponse({ type: DeleteReviewResponse, description: '리뷰 삭제 성공' })
  async delete(
    @ExtractPayload() authorId: number,
    @Param('targetReviewId') targetReviewId: number,
  ): Promise<BaseResponse<DeleteReviewResponse>> {
    return new BaseResponse<DeleteReviewResponse>(
      await this.reviewService.delete(authorId, targetReviewId),
    );
  }
}
