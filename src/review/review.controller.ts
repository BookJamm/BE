import { Controller } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('api/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
}
