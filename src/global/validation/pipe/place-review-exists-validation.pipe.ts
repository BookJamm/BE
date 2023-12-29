import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { PlaceReviewResponseCode } from 'src/place-review/exception/place-review-response-code';
import { PlaceReviewService } from 'src/place-review/place-review.service';
import { BaseException } from '../../base/base-exception';

@Injectable()
export class PlaceReviewExistsValidationPipe implements PipeTransform {
  constructor(private readonly reviewService: PlaceReviewService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: number, metadata: ArgumentMetadata) {
    if (value) {
      const isValid = await this.reviewService.isPlaceReviewExists(value);

      if (!isValid) {
        throw BaseException.of(PlaceReviewResponseCode.REVIEW_NOT_FOUND);
      }
    }

    return value;
  }
}
