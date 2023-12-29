import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { BaseException } from '../../base/base-exception';

@Injectable()
export class LatitudeValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: number, metadata: ArgumentMetadata) {
    const isValid = -90 <= value && value <= 90;

    if (!isValid) {
      throw BaseException.of(PlaceResponseCode.INVALID_LOCATION);
    }

    return value;
  }
}
