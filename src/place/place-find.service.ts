import { Injectable } from '@nestjs/common';
import { BaseException } from 'src/global/base/base-exception';
import { Place } from './entity/place.entity';
import { PlaceRepository } from './entity/place.repository';
import { PlaceResponseCode } from './exception/place-response-code';

@Injectable()
export class PlaceFindService {
  constructor(private readonly placeRepository: PlaceRepository) {}

  async findById(placeId: number): Promise<Place> {
    try {
      return this.placeRepository.findOneByOrFail({ placeId });
    } catch (error) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }
  }
}
