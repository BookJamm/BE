import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { PlaceService } from 'src/place/place.service';
import { BaseException } from '../base/base-exception';

@Injectable()
export class PlaceExistsValidationPipe implements PipeTransform {
  constructor(private readonly placeService: PlaceService) {}
  async transform(value: number, metadata: ArgumentMetadata) {
    if (value) {
      const isValid = await this.placeService.isPlaceExists(value);

      if (!isValid) {
        throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
      }
    }

    return value;
  }
}
