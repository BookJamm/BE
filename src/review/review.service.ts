import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { CreateReviewRequest } from 'src/place/dto/create-review-request.dto';
import { CreateReviewResponse } from 'src/place/dto/create-review-response.dto';
import { Place } from 'src/place/entity/place.entity';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { User } from 'src/user/entity/user.entity';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { Repository } from 'typeorm';
import { DeleteReviewResponse } from './dto/delete-review-response.dto';
import { ReviewListResponse } from './dto/review-list-response.dto';
import { ReviewImage } from './entity/review-image.entity';
import { Review } from './entity/review.entity';
import { ReviewRepository } from './entity/review.repository';
import { ReviewResponseCode } from './exception/review-response-code';

@Injectable()
export class ReviewService {
  private readonly logger: LoggerService = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    private readonly reviewRepository: ReviewRepository,
    @InjectRepository(ReviewImage)
    private readonly reviewImageRepository: Repository<ReviewImage>,
    private readonly s3Service: S3Service,
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
    try {
      await Promise.all(
        reviewImages.map(async image => {
          const key = this.s3Service.generateReviewKeyName(image.originalname);
          const imageUrl = await this.s3Service.uploadFile(key, image);

          const reviewImage = ReviewImage.createReviewImage(imageUrl, review);
          await this.reviewImageRepository.save(reviewImage);
        }),
      );
    } catch (error) {
      this.logger.error(error);
      throw BaseException.of(ReviewResponseCode.IMAGE_UPLOAD_FAIL);
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
    images.forEach(async ({ imageUrl }) => {
      const key = this.s3Service.getKeyFromUrl(imageUrl);
      await this.s3Service.deleteFile(key);
    });

    await this.reviewRepository.remove(review);
    return { deleted: true };
  }

  async findPlaceReviews(placeId: number, last: number): Promise<ReviewListResponse[]> {
    if (!(await this.placeRepository.exist({ where: { placeId } }))) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }
    const reviews = await this.reviewRepository.findById(placeId, last);

    await Promise.all(
      reviews.map(async review => {
        const images = await this.reviewImageRepository.findBy({
          reveiw: { reviewId: review.reviewId },
        });

        review.setImages(images);
      }),
    );

    return reviews;
  }
}
