import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { SortConditon } from 'src/place/entity/sort-conditon';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { BaseException } from '../../base/base-exception';

@Injectable()
export class SortConditionValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: string, metadata: ArgumentMetadata) {
    if (value) {
      switch (value) {
        case SortConditon.DISTANCE:
        case SortConditon.RATING:
        case SortConditon.REVIEW:
          return value;
        default:
          throw BaseException.of(PlaceResponseCode.INVALID_SORT_CONDITION);
      }
    }
  }
}
