import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';
import { getRegExp } from 'korean-regexp';
import { DateTime } from 'luxon';
import { BaseException } from 'src/global/base/base-exception';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ReviewImage } from 'src/place-review/entity/review-image.entity';
import { Repository } from 'typeorm';
import { PlaceDetailResponse } from './dto/response/place-detail-response.dto';
import { PlaceListResponse } from './dto/response/place-list-response.dto';
import { PlaceNewsResponse } from './dto/response/place-news-response.dto';
import { PlaceBookmark } from './entity/place-bookmark.entity';
import { PlaceHour } from './entity/place-hour.entity';
import { PlaceRepository } from './entity/place.repository';
import { SortConditon } from './entity/sort-conditon';
import { PlaceResponseCode } from './exception/place-response-code';

@Injectable()
export class PlaceService {
  private readonly PLACE_CATEGORY = [0, 1, 2];

  constructor(
    private readonly placeRepository: PlaceRepository,
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
    @InjectRepository(PlaceHour)
    private readonly placeHourRepository: Repository<PlaceHour>,
    @InjectRepository(PlaceBookmark)
    private readonly placeBookmarkRepository: Repository<PlaceBookmark>,
  ) {}

  async findPlacesByCategory(
    category: number,
    sortBy: string,
    lat: number,
    lon: number,
    last: number,
  ) {
    this.validateCategory(category);
    this.validateCoords(lat, lon);

    let places: PlaceListResponse[] = [];
    switch (sortBy) {
      case SortConditon.DISTANCE:
        places = await this.placeRepository.findByCategoryOrderByDistance(category, lat, lon, last);
        break;
      case SortConditon.RATING:
        places = await this.placeRepository.findByCategoryOrderByRating(category, lat, lon, last);
        break;
      case SortConditon.REVIEW:
        places = await this.placeRepository.findByCategoryOrderByReview(category, lat, lon, last);
        break;
      default:
        throw BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);
    }

    await Promise.all(
      places.map(async place => {
        const { placeId } = place;

        place.images = await this.getPlaceImages(placeId);
        place.open = await this.getPlaceOpen(placeId);
      }),
    );

    return places;
  }

  async findPlacesByKeyword(
    keyword: string,
    sortBy: string,
    lat: number,
    lon: number,
    last: number,
  ) {
    if (!keyword) {
      throw BaseException.of(GlobalResponseCode.EMPTY_KEYWORD);
    }

    this.validateCoords(lat, lon);

    const keywordRegExp = getRegExp(keyword).toString().slice(1, -2);

    let places: PlaceListResponse[] = [];
    switch (sortBy) {
      case SortConditon.DISTANCE:
        places = await this.placeRepository.findByKeywordOrderByDistance(
          keywordRegExp,
          lat,
          lon,
          last,
        );
        break;
      case SortConditon.RATING:
        places = await this.placeRepository.findByKeywordOrderByRating(
          keywordRegExp,
          lat,
          lon,
          last,
        );
        break;
      case SortConditon.REVIEW:
        places = await this.placeRepository.findByKeywordOrderByReview(
          keywordRegExp,
          lat,
          lon,
          last,
        );
        break;
      default:
        throw BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);
    }

    await Promise.all(
      places.map(async place => {
        const { placeId } = place;

        place.images = await this.getPlaceImages(placeId);
        place.open = await this.getPlaceOpen(placeId);
      }),
    );

    return places;
  }

  async findPlacesByBounds(
    center: number[],
    tr: number[],
    sortBy: string,
  ): Promise<PlaceListResponse[]> {
    this.validateCoords(center[0], center[1]);
    this.validateCoords(tr[0], tr[1]);

    let places: PlaceListResponse[] = [];
    switch (sortBy) {
      case SortConditon.DISTANCE:
        places = await this.placeRepository.findByBoundsOrderByDistance(center, tr);
        break;
      case SortConditon.RATING:
        places = await this.placeRepository.findByBoundsOrderByRating(center, tr);
        break;
      case SortConditon.REVIEW:
        places = await this.placeRepository.findByBoundsOrderByReview(center, tr);
        break;
      default:
        throw BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);
    }

    await Promise.all(
      places.map(async place => {
        const { placeId } = place;

        place.images = await this.getPlaceImages(placeId);
        place.open = await this.getPlaceOpen(placeId);
      }),
    );

    return places;
  }

  async getPlaceDetail(userId: number, placeId: number): Promise<PlaceDetailResponse> {
    const place = await this.placeRepository.findOne({
      where: { placeId },
      relations: ['address', 'hours'],
    });

    if (!place) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }

    return Builder<PlaceDetailResponse>()
      .address({ road: place.address.road, jibun: place.address.jibun })
      .bookmarked(await this.getPlaceBookmarked(placeId, userId))
      .category(place.category)
      .images(await this.getPlaceImages(placeId))
      .name(place.name)
      .open(await this.getPlaceOpen(placeId))
      .placeId(place.placeId)
      .rating(place.totalRating)
      .reviewCount(place.reviewCount)
      .website(place.website)
      .build();
  }

  async getPlaceNews(placeId: number, last: number): Promise<PlaceNewsResponse[]> {
    if (!(await this.placeRepository.exist({ where: { placeId: placeId } }))) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }

    return await this.placeRepository.findPlaceNews(placeId, last);
  }

  private validateCategory(category: number) {
    if (!this.PLACE_CATEGORY.includes(category)) {
      throw BaseException.of(PlaceResponseCode.INVALID_CATEGORY);
    }
  }

  private validateCoords(lat: number, lon: number) {
    const validLat = -90 <= lat && lat <= 90;
    const validLon = -180 <= lon && lon <= 180;
    if (!(validLat && validLon)) {
      throw BaseException.of(PlaceResponseCode.INVALID_LOCATION);
    }
  }

  private async getPlaceOpen(placeId: number) {
    const hours = await this.placeHourRepository.findOneBy({
      place: { placeId },
      day: DateTime.local({ zone: 'Asia/Seoul' }).day,
    });

    return this.checkOpen(hours);
  }

  private checkOpen(hours: PlaceHour | null) {
    if (!hours) {
      return null;
    }

    const { startTime, endTime } = hours;
    const now = DateTime.local({ zone: 'Asia/Seoul' });

    const [startHour, startMinute, startSecond] = startTime.split(':');
    const start = now.set({ hour: +startHour, minute: +startMinute, second: +startSecond });
    const [endHour, endMinute, endSecond] = endTime.split(':');
    const end = now.set({
      hour: Number(endHour),
      minute: Number(endMinute),
      second: Number(endSecond),
    });

    return start <= now && now <= end;
  }

  private async getPlaceImages(placeId: number) {
    return await this.reviewImageRepository.find({
      where: { reveiw: { place: { placeId } } },
      take: 5,
    });
  }

  private async getPlaceBookmarked(placeId: number, userId: number) {
    return await this.placeBookmarkRepository.exist({
      where: { place: { placeId }, bookmarker: { userId } },
    });
  }
}
