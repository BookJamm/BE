import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ReviewResponseCode } from 'src/place-review/exception/review-response-code';
import { PlaceReviewService } from 'src/place-review/place-review.service';
import { BaseException } from '../base/base-exception';

@Injectable()
export class PlaceReviewExistsValidationPipe implements PipeTransform {
  constructor(private readonly reviewService: PlaceReviewService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: number, metadata: ArgumentMetadata) {
    if (value) {
      const isValid = await this.reviewService.isReviewExists(value);

      if (!isValid) {
        throw BaseException.of(ReviewResponseCode.REVIEW_NOT_FOUND);
      }
    }

    return value;
  }
}
