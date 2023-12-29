import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/activity/entity/activity.entity';
import { ActivityResponseCode } from 'src/activity/exception/activity-response-code';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { CreatePlaceReviewRequest } from 'src/place/dto/request/create-place-review-request.dto';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { LessThan, Repository } from 'typeorm';
import { PlaceReview } from './entity/place-review.entity';
import { PlaceReviewResponseCode } from './exception/place-review-response-code';
import { PlaceReviewConverter } from './place-review.converter';

@Injectable()
export class PlaceReviewService {
  private readonly logger: Logger = new Logger(PlaceReviewService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(PlaceReview)
    private readonly placeReviewRepository: Repository<PlaceReview>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    authorId: number,
    placeId: number,
    request: CreatePlaceReviewRequest,
    reviewImages: Express.Multer.File[],
  ): Promise<PlaceReview> {
    const author: User = await this.userRepository.findOneBy({ userId: authorId });

    const place: Place = await this.placeRepository.findOneBy({ placeId });

    let activity: Activity;
    if (request.activityId) {
      activity = await this.activityRepository.findOneBy({
        activityId: request.activityId,
        place: { placeId },
      });

      if (activity === null) {
        throw BaseException.of(ActivityResponseCode.ACTIVITY_NOT_FOUND);
      }
    }

    const review = this.placeReviewRepository.save(
      await PlaceReviewConverter.toPlaceReview(request, author, place, activity, reviewImages),
    );

    return review;
  }

  async delete(userId: number, targetReviewId: number) {
    const review: PlaceReview = await this.placeReviewRepository.findOne({
      where: {
        author: { userId },
        reviewId: targetReviewId,
      },
      relations: ['images'],
    });

    if (!review) {
      throw BaseException.of(PlaceReviewResponseCode.NOT_OWNER);
    }

    await Promise.all(
      review.images.map(async image => {
        await this.s3Service.deleteFileByUrl(image.imageUrl);
      }),
    );

    this.placeReviewRepository.remove(review);
  }

  async findPlaceReviews(userId: number, placeId: number, last: number): Promise<PlaceReview[]> {
    const reviews = await this.placeReviewRepository.find({
      where: { place: { placeId }, reviewId: last ? LessThan(last) : null },
      relations: ['author', 'images'],
    });

    return reviews;
  }

  async isPlaceReviewExists(reviewId: number) {
    return this.placeReviewRepository.exist({ where: { reviewId } });
  }
}
