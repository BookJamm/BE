import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { CreateReviewRequest } from 'src/place/dto/request/create-review-request.dto';
import { CreateReviewResponse } from 'src/place/dto/response/create-review-response.dto';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { LessThan, Repository } from 'typeorm';
import { DeleteReviewResponse } from './dto/delete-review-response.dto';
import { PlaceReviewImage } from './entity/place-review-image.entity';
import { PlaceReview } from './entity/place-review.entity';

@Injectable()
export class PlaceReviewService {
  private readonly logger: Logger = new Logger(PlaceReviewService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(PlaceReview)
    private readonly reviewRepository: Repository<PlaceReview>,
    @InjectRepository(PlaceReviewImage)
    private readonly reviewImageRepository: Repository<PlaceReviewImage>,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
  ) {}
  async createReview(
    authorId: number,
    placeId: number,
    reviewDto: CreateReviewRequest,
    reviewImages: Express.Multer.File[],
  ): Promise<CreateReviewResponse> {
    // todo: 구현

    // const author: User = await this.userRepository.findOneBy({ userId: authorId });
    // if (!author) {
    //   throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    // }

    // const place: Place = await this.placeRepository.findOneBy({ placeId });
    // if (!place) {
    //   throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    // }

    // let review = PlaceReview.createReview(
    //   reviewDto.visitedAt,
    //   reviewDto.contents,
    //   reviewDto.rating,
    //   place,
    //   author,
    // );
    // review = await this.reviewRepository.save(review);

    // for (const image of reviewImages) {
    //   const imageUrl = await this.s3Service.uploadProfileImageFile(image);
    //   const reviewImage = .createReviewImage(imageUrl, review);
    //   await this.reviewImageRepository.save(reviewImage);
    // }

    // return { reviewId: review.reviewId };
    return null;
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
    const reviews = await this.reviewRepository.find({
      where: { place: { placeId }, reviewId: last ? LessThan(last) : null },
      relations: ['author', 'images'],
    });

    return reviews;
  }

  async isReviewExists(reviewId: number) {
    return this.reviewRepository.exist({ where: { reviewId } });
  }
}
