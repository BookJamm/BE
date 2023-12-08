import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
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
import { ActivityService } from 'src/activity/activity.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { LatitudeValidationPipe } from 'src/global/validation/latitude-validation.pipe';
import { LongitudeValidationPipe } from 'src/global/validation/longitutde-validation.pipe';
import { PlaceExistsValidationPipe } from 'src/global/validation/place-exists-validation.pipe';
import { ReviewListResponse } from 'src/place-review/dto/review-list-response.dto';
import { ReviewService } from 'src/place-review/review.service';
import { CreateReviewRequest } from './dto/request/create-review-request.dto';
import { ActivityListResponse } from './dto/response/activity-list-response.dto';
import { CreateReviewResponse } from './dto/response/create-review-response.dto';
import { PlaceDetailResponse } from './dto/response/place-detail-response.dto';
import { PlaceListResponse } from './dto/response/place-list-response.dto';
import { PlaceNewsResponse } from './dto/response/place-news-response.dto';
import { SortConditon } from './entity/sort-conditon';
import { PlaceService } from './place.service';

@Controller('api/places')
@UseGuards(JwtAuthGuard)
@ApiTags('places')
@ApiBearerAuth()
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
    private readonly reviewService: ReviewService,
    private readonly activityService: ActivityService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '카테고리로 장소 조회',
    description: '해당하는 카테고리의 장소를 정렬 기준에 맞추어 10개씩 페이징하여 조회한다.',
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
    @Query('sortBy') sortBy: string = 'distance',
    @Query('lat', LatitudeValidationPipe) lat: number,
    @Query('lon', LongitudeValidationPipe) lon: number,
    @Query('last', PlaceExistsValidationPipe) last: number,
  ): Promise<BaseResponse<PlaceListResponse[]>> {
    return new BaseResponse<PlaceListResponse[]>(
      await this.placeService.findPlaces(sortBy, lat, lon, last),
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
      await this.placeService.findPlacesByKeyword(keyword, sortBy, lat, lon, last),
    );
  }

  @Get('maps')
  @ApiOperation({
    summary: '지도에서 장소 조회',
    description: '현재 보고 있는 지도의 범위 내에서 장소를 조회합니다.',
  })
  @ApiQuery({
    name: 'center',
    description: '지도에서 중앙점의 좌표 ⚠️ 반드시 {위도}, {경도} 형식으로 보낼 것',
    example: '37.547689, 126.942383',
  })
  @ApiQuery({
    name: 'tr',
    description: '지도에서 우상단의 좌표 ⚠️ 반드시 {위도}, {경도} 형식으로 보낼 것',
    example: '37.572440, 126.885726',
  })
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준',
    enum: SortConditon,
    required: false,
    schema: {
      default: 'distance',
    },
  })
  @ApiOkResponse({
    description: '조회 성공',
    type: [PlaceListResponse],
  })
  async findPlacesByBounds(
    @Query('center', new ParseArrayPipe({ items: Number, separator: ',' })) center: number[],
    @Query('tr', new ParseArrayPipe({ items: Number, separator: ',' })) tr: number[],
    @Query('sortBy') sortBy: string = SortConditon.DISTANCE,
  ): Promise<BaseResponse<PlaceListResponse[]>> {
    return new BaseResponse<PlaceListResponse[]>(
      await this.placeService.findPlacesByBounds(center, tr, sortBy),
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
      await this.placeService.getPlaceDetail(userId, placeId),
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
    @ExtractPayload() userId: number,
    @Param('placeId') placeId: number,
    @Query('last') last: number,
  ): Promise<BaseResponse<ReviewListResponse[]>> {
    return new BaseResponse<ReviewListResponse[]>(
      await this.reviewService.findPlaceReviews(userId, placeId, last),
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
      await this.placeService.getPlaceNews(placeId, last),
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
      await this.reviewService.create(authorId, placeId, reqeust, reviewImages),
      GlobalResponseCode.CREATED,
    );
  }

  @Get(':placeId/activities')
  @ApiOperation({ summary: '장소 활동 조회' })
  @ApiParam({ name: 'placeId', description: '장소 아이디' })
  @ApiQuery({ name: 'last', description: '마지막으로 조회한 활동의 아이디, 페이징 용' })
  @ApiOkResponse({ type: ActivityListResponse })
  async findPlaceActivities(
    @Param('placeId') placeId: number,
    @Query('last') last: number,
  ): Promise<BaseResponse<ActivityListResponse[]>> {
    return new BaseResponse<ActivityListResponse[]>(
      await this.activityService.findPlaceActivities(placeId, last),
    );
  }
}
