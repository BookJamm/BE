import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/activity/entity/activity.entity';
import { ActivityResponseCode } from 'src/activity/exception/activity-response-code';
import { BaseException } from 'src/global/base/base-exception';
import { CreatePlaceReviewRequest } from 'src/place/dto/request/create-place-review-request.dto';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { LessThan, Repository } from 'typeorm';
import { DeleteReviewResponse } from './dto/delete-review-response.dto';
import { PlaceReviewImage } from './entity/place-review-image.entity';
import { PlaceReview } from './entity/place-review.entity';
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
    @InjectRepository(PlaceReviewImage)
    private readonly reviewImageRepository: Repository<PlaceReviewImage>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly userService: UserService,
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

  async delete(ownerId: number, targetReviewId: number): Promise<DeleteReviewResponse> {
    //todo: 구현

    // const review = await this.reviewRepository.findOne({
    //   where: { reviewId: targetReviewId },
    //   relations: ['author'],
    // });
    // if (!review) {
    //   throw BaseException.of(ReviewResponseCode.REVIEW_NOT_FOUND);
    // }
    // if (review.author.userId !== ownerId) {
    //   throw BaseException.of(ReviewResponseCode.NOT_OWNER);
    // }
    // const images = await this.reviewImageRepository.findBy({
    //   reveiw: { reviewId: targetReviewId },
    // });
    // for (const image of images) {
    //   await this.s3Service.deleteFileByUrl(image.imageUrl);
    // }
    // await this.reviewRepository.remove(review);
    // return { deleted: true };

    return null;
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
