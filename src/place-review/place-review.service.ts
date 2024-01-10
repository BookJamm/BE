import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/activity/entity/activity.entity';
import { ActivityResponseCode } from 'src/activity/exception/activity-response-code';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { ContentsReport } from 'src/global/entity/contents-report.entity';
import { ContentsType } from 'src/global/entity/enum/contents-type';
import { CreatePlaceReviewRequest } from 'src/place/dto/request/create-place-review-request.dto';
import { Place } from 'src/place/entity/place.entity';
import { UserReport } from 'src/user/entity/user-report.entity';
import { User } from 'src/user/entity/user.entity';
import { And, In, LessThan, Not, Repository } from 'typeorm';
import { PatchPlaceReviewRequest } from './dto/request/patch-place-review-request.dto';
import { ReportPlaceReviewRequest } from './dto/request/report-place-review-request.dto';
import { PlaceReviewImage } from './entity/place-review-image.entity';
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
    @InjectRepository(PlaceReviewImage)
    private readonly placeReviewImageRepository: Repository<PlaceReviewImage>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(UserReport)
    private readonly userReportRepository: Repository<UserReport>,
    @InjectRepository(ContentsReport)
    private readonly contentsReportRepository: Repository<ContentsReport>,
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
    const userReports = await this.userReportRepository.find({
      where: { reporter: { userId } },
      relations: { targetUser: true },
    });

    const contentsReports = await this.contentsReportRepository.find({
      where: { reporter: { userId }, contentsType: ContentsType.PLACE_REVIEW },
      relations: { placeReivew: true },
    });

    const reviews = await this.placeReviewRepository.find({
      where: {
        place: { placeId },
        reviewId: last
          ? And(LessThan(last), Not(In(contentsReports.map(report => report.placeReivew.reviewId))))
          : Not(In(contentsReports.map(report => report.placeReivew.reviewId))),
        author: { userId: Not(In(userReports.map(report => report.targetUser.userId))) },
      },
      relations: ['author', 'images'],
      take: 10,
    });

    return reviews;
  }

  async isPlaceReviewExists(reviewId: number) {
    return this.placeReviewRepository.exist({ where: { reviewId } });
  }

  async reportPlaceReview(
    request: ReportPlaceReviewRequest,
    reporterId: number,
    targetReviewId: number,
  ): Promise<ContentsReport> {
    const reporter = await this.userRepository.findOneBy({ userId: reporterId });

    const isAlreadyReported = await this.contentsReportRepository.exist({
      where: { reporter: { userId: reporterId }, placeReivew: { reviewId: targetReviewId } },
    });
    if (isAlreadyReported) {
      throw BaseException.of(PlaceReviewResponseCode.REVIEW_ALREADY_REPORTED);
    }

    const targetReview = await this.placeReviewRepository.findOne({
      where: { reviewId: targetReviewId },
      relations: { author: true },
    });

    if (targetReview.author.userId === reporterId) {
      throw BaseException.of(PlaceReviewResponseCode.OWNER_REPORT);
    }

    const contentsReport = PlaceReviewConverter.toContentsReport(request, reporter, targetReview);

    return this.contentsReportRepository.save(contentsReport);
  }

  async updatePlaceReview(
    request: PatchPlaceReviewRequest,
    userId: number,
    reviewId: number,
    newImages: Express.Multer.File[],
  ): Promise<PlaceReview> {
    const review = await this.placeReviewRepository.findOne({
      where: { reviewId },
      relations: { author: true, place: true, images: true },
    });

    // 작성자 본인 확인
    if (review.author.userId !== userId) {
      throw BaseException.of(PlaceReviewResponseCode.NOT_OWNER);
    }

    // 남긴 이미지 + 새 이미지 개수 확인
    if (request.remainImages.length + newImages.length > 3) {
      throw BaseException.of(PlaceReviewResponseCode.IMAGES_NUM_EXCEEDED);
    }

    // 남긴 이미지 존재 확인
    await Promise.all(
      request.remainImages.map(async imageId => {
        if (!(await this.placeReviewImageRepository.exist({ where: { id: imageId } }))) {
          throw BaseException.of(PlaceReviewResponseCode.IMAGE_NOT_FOUND);
        }
      }),
    );

    let activity: Activity;
    if (request.activityId) {
      activity = await this.activityRepository.findOneBy({
        activityId: request.activityId,
        place: { placeId: review.place.placeId },
      });

      if (activity === null) {
        throw BaseException.of(ActivityResponseCode.ACTIVITY_NOT_FOUND);
      }
    }

    // 기존 이미지 삭제
    await Promise.all(
      review.images.map(async image => {
        if (!request.remainImages.includes(image.id)) {
          await this.s3Service.deleteFileByUrl(image.imageUrl);
          await this.placeReviewImageRepository.remove(image);
        }
      }),
    );

    // 새 이미지 추가
    await Promise.all(
      newImages.map(async image => {
        const imageUrl = await this.s3Service.uploadPlaceReviewImageFile(image);
        const newPlaceImage = PlaceReviewConverter.toPlaceReviewImage(imageUrl);
        newPlaceImage.review = review;

        await this.placeReviewImageRepository.save(newPlaceImage);
      }),
    );

    const updatedReview = await this.placeReviewRepository.save(
      await PlaceReviewConverter.toUpdatePlaceReview(review, request, activity),
    );

    return updatedReview;
  }
}
