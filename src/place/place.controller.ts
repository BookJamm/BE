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
import { ActivityService } from 'src/activity/activity.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { LatitudeValidationPipe } from 'src/global/validation/latitude-validation.pipe';
import { LongitudeValidationPipe } from 'src/global/validation/longitutde-validation.pipe';
import { PlaceExistsValidationPipe } from 'src/global/validation/place-exists-validation.pipe';
import { PlaceNewsExistsValidationPipe } from 'src/global/validation/place-news-exists-validation.pipe';
import { PlaceReviewExistsValidationPipe } from 'src/global/validation/place-review-exists-validation.pipe';
import { SortConditionValidationPipe } from 'src/global/validation/sort-condition-validation.pipe';
import { PlaceReviewResponse } from 'src/place-review/dto/place-review-response.dto';
import { PlaceReviewService } from 'src/place-review/place-review.service';
import { CreateReviewRequest } from './dto/request/create-review-request.dto';
import { SortConditon } from './dto/request/sort-conditon';
import { ActivityListResponse } from './dto/response/activity-list-response.dto';
import { CreateReviewResponse } from './dto/response/create-review-response.dto';
import { PlaceDetailResponse } from './dto/response/place-detail-response.dto';
import { PlaceNewsResponse } from './dto/response/place-news-response.dto';
import { PlacePreviewResponse } from './dto/response/place-preview-response.dto';
import { PlaceConverter } from './place.converter';
import { PlaceService } from './place.service';

@Controller('api/places')
@UseGuards(JwtAuthGuard)
@ApiTags('독립 서점 관련 API')
@ApiBearerAuth()
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
    private readonly placeReviewService: PlaceReviewService,
    private readonly activityService: ActivityService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '독립 서점 조회',
    description: '해당하는 카테고리의 장소를 정렬 기준에 맞추어 10개씩 페이징하여 조회합니다.',
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
  @ApiQuery({
    name: 'lat',
    description: '현재 위치 위도 (-90 ~ 90, 소수 여섯째 자리까지만)',
    example: 37.234663,
  })
  @ApiQuery({
    name: 'lon',
    description: '현재 위치 경도 (-180 ~ 180, 소수 여섯째 자리까지만)',
    example: 127.061425,
  })
  @ApiQuery({
    name: 'last',
    description: '마지막으로 본 장소의 아이디 (페이징 용)',
    example: 4,
    required: false,
  })
  @ApiOkResponse({ type: [PlacePreviewResponse], description: '장소 조회 성공' })
  async findPlaces(
    @Query('sortBy', SortConditionValidationPipe) sortBy: string = SortConditon.DISTANCE,
    @Query('lat', LatitudeValidationPipe) lat: number,
    @Query('lon', LongitudeValidationPipe) lon: number,
    @Query('last', PlaceExistsValidationPipe) last: number,
  ): Promise<BaseResponse<PlacePreviewResponse[]>> {
    const places = await this.placeService.findPlaces(sortBy, lat, lon, last);

    return BaseResponse.of(PlaceConverter.toPlacePreviewListResponse(places));
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
    required: false,
    schema: {
      default: 'distance',
    },
  })
  @ApiQuery({
    name: 'lat',
    description: '현재 위치 위도 ([-90, 90], 소수 여섯째 자리까지만)',
    example: 37.238293,
  })
  @ApiQuery({
    name: 'lon',
    description: '현재 위치 경도 ([-180, 180], 소수 여섯째 자리까지만)',
    example: 127.075852,
  })
  @ApiQuery({
    name: 'last',
    description: '마지막으로 본 장소의 아이디 (페이징 용)',
    example: 5,
  })
  @ApiOkResponse({ type: [PlacePreviewResponse], description: '장소 검색 성공' })
  async findPlacesByKeyword(
    @Query('keyword') keyword: string,
    @Query('sortBy', SortConditionValidationPipe) sortBy: string,
    @Query('lat', LatitudeValidationPipe) lat: number,
    @Query('lon', LongitudeValidationPipe) lon: number,
    @Query('last', PlaceExistsValidationPipe) last: number,
  ): Promise<BaseResponse<PlacePreviewResponse[]>> {
    const places = await this.placeService.findPlacesByKeyword(keyword, sortBy, lat, lon, last);

    return BaseResponse.of(PlaceConverter.toPlacePreviewListResponse(places));
  }

  @Get('maps')
  @ApiOperation({
    summary: '지도에서 장소 조회',
    description: '현재 보고 있는 지도의 범위 내에서 장소를 조회합니다.',
  })
  @ApiQuery({
    name: 'centerLat',
    description: '지도 중앙의 위도',
    example: '37.547689',
  })
  @ApiQuery({
    name: 'centerLon',
    description: '지도 중앙의 경도',
    example: '126.942383',
  })
  @ApiQuery({
    name: 'topRightLat',
    description: '지도에서 우상단의 위도',
    example: '37.572440',
  })
  @ApiQuery({
    name: 'topRightLon',
    description: '지도에서 좌상단의 경도',
    example: '126.885726',
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
    type: [PlacePreviewResponse],
  })
  async findPlacesByBounds(
    @Query('centerLat', LatitudeValidationPipe) centerLat: number,
    @Query('centerLon', LongitudeValidationPipe) centerLon: number,
    @Query('topRightLat', LatitudeValidationPipe) topRightLat: number,
    @Query('topRightLon', LongitudeValidationPipe) topRightLon: number,
    @Query('sortBy', SortConditionValidationPipe) sortBy: string = SortConditon.DISTANCE,
  ): Promise<BaseResponse<PlacePreviewResponse[]>> {
    const places = await this.placeService.findPlacesByBounds(
      [centerLat, centerLon],
      [topRightLat, topRightLon],
      sortBy,
    );

    return BaseResponse.of(PlaceConverter.toPlacePreviewListResponse(places));
  }

  @Get(':placeId')
  @ApiOperation({ summary: '장소 세부 정보 조회' })
  @ApiParam({ name: 'placeId', description: '세부 정보를 불러올 장소의 아이디' })
  @ApiOkResponse({ type: PlaceDetailResponse })
  async getPlaceDetail(
    @ExtractPayload() userId: number,
    @Param('placeId', PlaceExistsValidationPipe) placeId: number,
  ): Promise<BaseResponse<PlaceDetailResponse>> {
    const place = await this.placeService.getPlaceDetail(placeId);

    return BaseResponse.of(await PlaceConverter.toPlaceDetailResponse(place));
  }

  @Get(':placeId/reviews')
  @ApiOperation({
    summary: '장소 리뷰 조회',
    description: '해당 장소의 리뷰를 최신순으로 10개씩 페이징하여 조회한다.',
  })
  @ApiOkResponse({ description: '장소 리뷰 조회 성공', type: [PlaceReviewResponse] })
  @ApiParam({ name: 'placeId', description: '리뷰를 조회할 장소의 아이디' })
  @ApiQuery({
    name: 'last',
    description: '마지막으로 조회한 리뷰의 아이디 (페이징 용)',
    required: false,
  })
  async findPlaceReviews(
    @ExtractPayload() userId: number,
    @Param('placeId', PlaceExistsValidationPipe) placeId: number,
    @Query('last', PlaceReviewExistsValidationPipe) last: number,
  ): Promise<BaseResponse<PlaceReviewResponse[]>> {
    const reviews = await this.placeReviewService.findPlaceReviews(userId, placeId, last);

    return BaseResponse.of(PlaceConverter.toPlaceReviewResponseList(reviews));
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
    @Param('placeId', PlaceExistsValidationPipe) placeId: number,
    @Query('last', PlaceNewsExistsValidationPipe) last: number,
  ): Promise<BaseResponse<PlaceNewsResponse[]>> {
    const places = await this.placeService.getPlaceNews(placeId, last);

    return BaseResponse.of(PlaceConverter.toPlaceNewsListResponse(places));
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
    return BaseResponse.of(
      await this.placeReviewService.createReview(authorId, placeId, reqeust, reviewImages),
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
    return BaseResponse.of(await this.activityService.findPlaceActivities(placeId, last));
  }
}
