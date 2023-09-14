import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { ReviewListResponse } from 'src/review/dto/review-list-response.dto';
import { ReviewService } from 'src/review/review.service';
import { CreateReviewRequest } from './dto/create-review-request.dto';
import { CreateReviewResponse } from './dto/create-review-response.dto';
import { PlaceDetailResponse } from './dto/place-detail-response.dto';
import { PlaceListResponse } from './dto/place-list-response.dto';
import { PlaceNewsResponse } from './dto/place-news-response.dto';
import { SortConditon } from './entity/sort-conditon';
import { PlaceService } from './place.service';

@Controller('api/places')
@UseGuards(JwtAuthGuard)
@ApiTags('places')
@ApiBearerAuth()
export class PlaceController {
  constructor(
    private readonly placesService: PlaceService,
    private readonly reviewsService: ReviewService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '카테고리로 장소 조회',
    description: '해당하는 카테고리의 장소를 정렬 기준에 맞추어 10개씩 페이징하여 조회한다.',
  })
  @ApiQuery({
    name: 'category',
    description: '장소 카테고리',
    enum: [0, 1, 2],
  })
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준',
    enum: ['distance', 'review', 'rating'],
    required: false,
    schema: {
      default: 'distance',
    },
  })
  @ApiQuery({
    name: 'lat',
    description: '현재 위치 위도',
    example: 37.234663,
  })
  @ApiQuery({
    name: 'lon',
    description: '현재 위치 경도',
    example: 127.061425,
  })
  @ApiQuery({
    name: 'last',
    description: '마지막으로 본 장소의 아이디 (페이징 용)',
    example: 4,
    required: false,
  })
  @ApiOkResponse({ type: [PlaceListResponse], description: '장소 조회 성공' })
  async findPlacesByCategory(
    @Query('category') category: number,
    @Query('sortBy') sortBy: string = 'distance',
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('last') last: number,
  ): Promise<BaseResponse<PlaceListResponse[]>> {
    return new BaseResponse<PlaceListResponse[]>(
      await this.placesService.findPlacesByCategory(category, sortBy, lat, lon, last),
    );
  }

  @Get('search')
  @ApiOperation({
    summary: '장소 검색',
    description: '타이핑 할 때마다(자모음 단위로) 검색할 수 있습니다.',
  })
  @ApiQuery({
    name: 'keyword',
    description: '검색 키워드',
    example: '서른ㅊ',
  })
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준',
    enum: SortConditon,
    example: 'review',
    required: false,
    schema: {
      default: 'distance',
    },
  })
  @ApiQuery({
    name: 'lat',
    description: '현재 위치 위도',
    example: 37.238293,
  })
  @ApiQuery({
    name: 'lon',
    description: '현재 위치 경도',
    example: 127.075852,
  })
  @ApiQuery({
    name: 'last',
    description: '마지막으로 본 장소의 아이디 (페이징 용)',
    example: 5,
  })
  @ApiOkResponse({ type: [PlaceListResponse], description: '장소 검색 성공' })
  async findPlacesByKeyword(
    @Query('keyword') keyword: string,
    @Query('sortBy') sortBy: string,
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('last') last: number,
  ): Promise<BaseResponse<PlaceListResponse[]>> {
    return new BaseResponse<PlaceListResponse[]>(
      await this.placesService.findPlacesByKeyword(keyword, sortBy, lat, lon, last),
    );
  }

  @Get(':placeId')
  @ApiOperation({ summary: '장소 세부 정보 조회' })
  @ApiParam({ name: 'placeId', description: '세부 정보를 불러올 장소의 아이디' })
  @ApiOkResponse({ type: PlaceDetailResponse })
  async getPlaceDetail(
    @ExtractPayload() userId: number,
    @Param('placeId') placeId: number,
  ): Promise<BaseResponse<PlaceDetailResponse>> {
    return new BaseResponse<PlaceDetailResponse>(
      await this.placesService.getPlaceDeatil(userId, placeId),
    );
  }

  @Get(':placeId/reviews')
  @ApiOperation({
    summary: '장소 리뷰 조회',
    description: '해당 장소의 리뷰를 최신순으로 10개씩 페이징하여 조회한다.',
  })
  @ApiOkResponse({ description: '장소 리뷰 조회 성공', type: [ReviewListResponse] })
  @ApiParam({ name: 'placeId', description: '리뷰를 조회할 장소의 아이디' })
  @ApiQuery({
    name: 'last',
    description: '마지막으로 조회한 리뷰의 아이디 (페이징 용)',
    required: false,
  })
  async findPlaceReviews(
    @Param('placeId') placeId: number,
    @Query('last') last: number,
  ): Promise<BaseResponse<ReviewListResponse[]>> {
    return new BaseResponse<ReviewListResponse[]>(
      await this.reviewsService.findPlaceReviews(placeId, last),
    );
  }

  @Get(':placeId/news')
  @ApiOperation({
    summary: '장소 소식 조회',
    description: '해당 장소의 소식을 최신순으로 5개씩 페이징하여 조회한다.',
  })
  @ApiParam({ name: 'placeId', description: '소식을 조회할 장소의 아이디' })
  @ApiQuery({ name: 'last', description: '마지막으로 본 소식의 아이디 (페이징 용)' })
  @ApiOkResponse({ type: [PlaceNewsResponse] })
  async findPlaceNews(
    @Param('placeId') placeId: number,
    @Query('last') last: number,
  ): Promise<BaseResponse<PlaceNewsResponse[]>> {
    return new BaseResponse<PlaceNewsResponse[]>(
      await this.placesService.getPlaceNews(placeId, last),
    );
  }

  @Post(':placeId/reviews')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiConsumes('multipart/form-data')
  @ApiExtraModels(CreateReviewRequest)
  @ApiBody({
    schema: {
      allOf: [
        {
          type: 'object',
          properties: {
            images: {
              type: 'string',
              format: 'binary',
            },
          },
        },
        { $ref: getSchemaPath(CreateReviewRequest) },
      ],
    },
  })
  @ApiOperation({
    summary: '리뷰 등록',
    description:
      '해당 장소에 리뷰를 등록한다. 사진은 5장까지 업로드 가능. ⚠️ multipart/form-data로 요청',
  })
  @ApiCreatedResponse({ description: '리뷰 등록 성공', type: CreateReviewResponse })
  async createReview(
    @ExtractPayload() authorId: number,
    @Param('placeId') placeId: number,
    @Body() reqeust: CreateReviewRequest,
    @UploadedFiles() reviewImages: Express.Multer.File[],
  ): Promise<BaseResponse<CreateReviewResponse>> {
    return new BaseResponse(
      await this.reviewsService.create(authorId, placeId, reqeust, reviewImages),
      GlobalResponseCode.CREATED,
    );
  }
}
