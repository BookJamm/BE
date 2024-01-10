import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { PlaceReviewExistsValidationPipe } from 'src/global/validation/pipe/place-review-exists-validation.pipe';
import { PatchPlaceReviewRequest } from './dto/request/patch-place-review-request.dto';
import { ReportPlaceReviewRequest } from './dto/request/report-place-review-request.dto';
import { DeleteReviewResponse } from './dto/response/delete-review-response.dto';
import { PatchPlaceReviewResponse } from './dto/response/patch-place-review-response.dto';
import { ReportPlaceReviewResponse } from './dto/response/report-place-review-response.dto';
import { PlaceReviewConverter } from './place-review.converter';
import { PlaceReviewService } from './place-review.service';

@Controller('api/place-reviews')
@UseGuards(JwtAuthGuard)
@ApiTags('독립 서점 리뷰 관련 API')
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

  @Post(':targetReviewId/reports')
  @ApiOperation({ summary: '리뷰 신고 API' })
  @ApiParam({ name: 'targetReviewId', description: '신고할 리뷰의 아이디', example: 1 })
  @ApiCreatedResponse({ type: ReportPlaceReviewResponse, description: '리뷰 신고 성공' })
  async reportPlaceReview(
    @ExtractPayload() reporterId: number,
    @Param('targetReviewId', PlaceReviewExistsValidationPipe) targetReviewId: number,
    @Body() request: ReportPlaceReviewRequest,
  ): Promise<BaseResponse<ReportPlaceReviewResponse>> {
    const contentsReport = await this.placeReviewService.reportPlaceReview(
      request,
      reporterId,
      targetReviewId,
    );

    return BaseResponse.of(
      PlaceReviewConverter.toReportPlaceReviewResponse(contentsReport),
      GlobalResponseCode.CREATED,
    );
  }

  @Patch(':reviewId')
  @UseInterceptors(FilesInterceptor('images', 3))
  @ApiConsumes('multipart/form-data')
  @ApiExtraModels(PatchPlaceReviewRequest)
  @ApiBody({
    schema: {
      allOf: [
        {
          type: 'object',
          properties: {
            images: {
              description: '업로드 할 사진 (최대 3개)',
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
              maxItems: 3,
            },
          },
        },
        { $ref: getSchemaPath(PatchPlaceReviewRequest) },
      ],
    },
  })
  @ApiOperation({ summary: '리뷰 수정 API' })
  @ApiParam({ name: 'reviewId', description: '수정할 리뷰의 아이디', example: 1 })
  @ApiOkResponse({ type: PatchPlaceReviewResponse })
  async updatePlaceReview(
    @ExtractPayload() userId: number,
    @Param('reviewId', PlaceReviewExistsValidationPipe) reviewId: number,
    @Body() request: PatchPlaceReviewRequest,
    @UploadedFiles() newImages: Express.Multer.File[],
  ): Promise<BaseResponse<PatchPlaceReviewResponse>> {
    const updatedReview = await this.placeReviewService.updatePlaceReview(
      request,
      userId,
      reviewId,
      newImages,
    );

    return BaseResponse.of(PlaceReviewConverter.toPatchPlaceReviewResponse(updatedReview));
  }
}
