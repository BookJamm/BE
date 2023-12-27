import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { BaseException } from '../../base/base-exception';

@Injectable()
export class LongitudeValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: number, metadata: ArgumentMetadata) {
    const isValid = -180 <= value && value <= 180;

    if (!isValid) {
      throw BaseException.of(PlaceResponseCode.INVALID_LOCATION);
    }

    return value;
  }
}
