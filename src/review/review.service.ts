import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReviewRequest } from 'src/place/dto/create-review-request.dto';
import { CreateReviewResponse } from 'src/place/dto/create-review-response.dto';
import { Place } from 'src/place/entity/place.entity';
import { PlaceFindService } from 'src/place/place-find.service';
import { User } from 'src/user/entity/user.entity';
import { UserFindService } from 'src/user/user-find.service';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    private readonly placeFindService: PlaceFindService,
    private readonly userFindService: UserFindService,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}
  async create(
    authorId: number,
    placeId: number,
    reviewDto: CreateReviewRequest,
  ): Promise<CreateReviewResponse> {
    const author: User = await this.userFindService.findById(authorId);
    const place: Place = await this.placeFindService.findById(placeId);

    const review = Review.createReview(
      reviewDto.visitedAt,
      reviewDto.contents,
      reviewDto.rating,
      place,
      author,
    );

    const { reviewId } = await this.reviewRepository.save(review);

    return { reviewId };
  }
}
