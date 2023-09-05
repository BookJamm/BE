import { Injectable } from '@nestjs/common';
import { BaseException } from 'src/global/base/base-exception';
import { PlaceRepository } from './entities/place.repository';
import { SortConditon } from './entities/sort-conditon';
import { PlaceResponseCode } from './exception/place-response-code';

@Injectable()
export class PlacesService {
  private readonly PLACE_CATEGORY = [0, 1, 2];

  constructor(private readonly placeRepository: PlaceRepository) {}

  async findByCategory(category: number, sortBy: string, lat: number, lon: number, last: number) {
    this.validateCategory(category);

    this.validateCoords(lat, lon);

    switch (sortBy) {
      case SortConditon.DISTANCE:
        return await this.placeRepository.findByCategoryOrderByDistance(category, lat, lon, last);
      case SortConditon.RATING:
        return await this.placeRepository.findByCategoryOrderByRating(category, lat, lon, last);
      case SortConditon.REVIEW:
        return await this.placeRepository.findByCategoryOrderByReview(category, lat, lon, last);
      default:
        throw BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);
    }
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

  findOne(id: number) {
    return `This action returns a #${id} place`;
  }
}
