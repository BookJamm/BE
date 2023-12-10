import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRegExp } from 'korean-regexp';
import { DateTime } from 'luxon';
import { PlaceReviewImage } from 'src/place-review/entity/place-review-image.entity';
import { LessThan, Repository } from 'typeorm';
import { SortConditon } from './dto/request/sort-conditon';
import { RawPlace } from './dto/response/place-preview-response.dto';
import { PlaceHour } from './entity/place-hour.entity';
import { PlaceNews } from './entity/place-news.entity';
import { Place } from './entity/place.entity';
import { PlaceRepository } from './entity/place.repository';

@Injectable()
export class PlaceService {
  constructor(
    private readonly placeRepository: PlaceRepository,
    @InjectRepository(PlaceReviewImage)
    private readonly reviewImageRepository: Repository<PlaceReviewImage>,
    @InjectRepository(PlaceHour)
    private readonly placeHourRepository: Repository<PlaceHour>,

    @InjectRepository(PlaceNews)
    private readonly placeNewsRepository: Repository<PlaceNews>,
  ) {}

  async isPlaceExists(placeId: number) {
    return this.placeRepository.exist({ where: { placeId } });
  }

  async isPlaceNewsExists(newsId: number) {
    return this.placeNewsRepository.exist({ where: { newsId } });
  }

  async findPlaces(sortBy: string, lat: number, lon: number, last: number) {
    let places: RawPlace[] = [];
    switch (sortBy) {
      case SortConditon.DISTANCE:
        places = await this.placeRepository.findAllOrderByDistance(lat, lon, last);
        break;
      case SortConditon.RATING:
        places = await this.placeRepository.findAllOrderByRating(lat, lon, last);
        break;
      case SortConditon.REVIEW:
        places = await this.placeRepository.findAllOrderByReivew(lat, lon, last);
        break;
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
  ): Promise<RawPlace[]> {
    const keywordRegExp = getRegExp(keyword).toString().slice(1, -2);

    let places: RawPlace[] = [];
    switch (sortBy) {
      case SortConditon.DISTANCE:
        places = await this.placeRepository.findAllByKeywordOrderByDistance(
          keywordRegExp,
          lat,
          lon,
          last,
        );
        break;
      case SortConditon.RATING:
        places = await this.placeRepository.findAllByKeywordOrderByRating(
          keywordRegExp,
          lat,
          lon,
          last,
        );
        break;
      case SortConditon.REVIEW:
        places = await this.placeRepository.findAllByKeywordOrderByReview(
          keywordRegExp,
          lat,
          lon,
          last,
        );
        break;
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

  async findPlacesByBounds(center: number[], tr: number[], sortBy: string): Promise<RawPlace[]> {
    let places: RawPlace[] = [];
    switch (sortBy) {
      case SortConditon.DISTANCE:
        places = await this.placeRepository.findAllByBoundsOrderByDistance(center, tr);
        break;
      case SortConditon.RATING:
        places = await this.placeRepository.findAllByBoundsOrderByRating(center, tr);
        break;
      case SortConditon.REVIEW:
        places = await this.placeRepository.findAllByBoundsOrderByReview(center, tr);
        break;
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

  async getPlaceDetail(placeId: number): Promise<Place> {
    return await this.placeRepository.findOne({
      where: { placeId },
      relations: ['address', 'hours'],
    });
  }

  async getPlaceNews(placeId: number, last: number): Promise<PlaceNews[]> {
    return await this.placeNewsRepository.find({
      where: { place: { placeId }, newsId: last ? LessThan(last) : null },
      take: 10,
    });
  }

  async getPlaceOpen(placeId: number) {
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

  async getPlaceImages(placeId: number) {
    return await this.reviewImageRepository.find({
      where: { review: { place: { placeId } } },
      take: 5,
    });
  }
}
