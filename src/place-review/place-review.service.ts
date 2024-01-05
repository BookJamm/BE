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
import { ReportPlaceReviewRequest } from './dto/request/report-place-review-request.dto';
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
}
