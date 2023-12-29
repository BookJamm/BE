import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { PlaceService } from 'src/place/place.service';
import { BaseException } from '../../base/base-exception';

@Injectable()
export class PlaceNewsExistsValidationPipe implements PipeTransform {
  constructor(private readonly placeService: PlaceService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: number, metadata: ArgumentMetadata) {
    if (value) {
      const isValid = await this.placeService.isPlaceNewsExists(value);

      if (!isValid) {
        throw BaseException.of(PlaceResponseCode.NEWS_NOT_FOUND);
      }
    }

    return value;
  }
}
