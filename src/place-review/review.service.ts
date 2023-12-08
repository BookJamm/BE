import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Builder } from 'builder-pattern';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { CreateReviewRequest } from 'src/place/dto/request/create-review-request.dto';
import { CreateReviewResponse } from 'src/place/dto/response/create-review-response.dto';
import { Place } from 'src/place/entity/place.entity';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { User } from 'src/user/entity/user.entity';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { UserService } from 'src/user/user.service';
import { LessThan, Repository } from 'typeorm';
import { DeleteReviewResponse } from './dto/delete-review-response.dto';
import { ReviewListResponse } from './dto/review-list-response.dto';
import { ReviewImage } from './entity/review-image.entity';
import { Review } from './entity/review.entity';
import { ReviewResponseCode } from './exception/review-response-code';

@Injectable()
export class ReviewService {
  private readonly logger: Logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
  ) {}
  async create(
    authorId: number,
    placeId: number,
    reviewDto: CreateReviewRequest,
    reviewImages: Express.Multer.File[],
  ): Promise<CreateReviewResponse> {
    const author: User = await this.userRepository.findOneBy({ userId: authorId });
    if (!author) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }

    const place: Place = await this.placeRepository.findOneBy({ placeId });
    if (!place) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }

    let review = Review.createReview(
      reviewDto.visitedAt,
      reviewDto.contents,
      reviewDto.rating,
      place,
      author,
    );
    review = await this.reviewRepository.save(review);

    for (const image of reviewImages) {
      const imageUrl = await this.s3Service.uploadProfileImageFile(image);
      const reviewImage = ReviewImage.createReviewImage(imageUrl, review);
      await this.reviewImageRepository.save(reviewImage);
    }

    return { reviewId: review.reviewId };
  }

  async delete(ownerId: number, targetReviewId: number): Promise<DeleteReviewResponse> {
    const review = await this.reviewRepository.findOne({
      where: { reviewId: targetReviewId },
      relations: ['author'],
    });

    if (!review) {
      throw BaseException.of(ReviewResponseCode.REVIEW_NOT_FOUND);
    }

    if (review.author.userId !== ownerId) {
      throw BaseException.of(ReviewResponseCode.NOT_OWNER);
    }

    const images = await this.reviewImageRepository.findBy({
      reveiw: { reviewId: targetReviewId },
    });

    for (const image of images) {
      await this.s3Service.deleteFileByUrl(image.imageUrl);
    }

    await this.reviewRepository.remove(review);
    return { deleted: true };
  }

  async findPlaceReviews(
    userId: number,
    placeId: number,
    last: number,
  ): Promise<ReviewListResponse[]> {
    if (!(await this.placeRepository.exist({ where: { placeId } }))) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }

    const reviews = await this.reviewRepository.find({
      where: { place: { placeId }, reviewId: last ? LessThan(last) : null },
      relations: ['author', 'images'],
    });

    const reviewResponse = await Promise.all(
      reviews.map(async review =>
        Builder<ReviewListResponse>()
          .author({
            userId: review.author.userId,
            username: review.author.username,
            profileImage: review.author.profileImage,
            following: await this.userService.getFollowing(userId, review.author.userId),
          })
          .contents(review.contents)
          .images(review.images)
          .rating(review.rating)
          .reviewId(review.reviewId)
          .visitedAt(review.visitedAt)
          .createdAt(review.createdAt)
          .updatedAt(review.updatedAt)
          .build(),
      ),
    );

    return reviewResponse;
  }
}
