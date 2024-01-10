import { Injectable, OnModuleInit } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Activity } from 'src/activity/entity/activity.entity';
import { S3Service } from 'src/aws/s3/s3.service';
import { ContentsReport } from 'src/global/entity/contents-report.entity';
import { ContentsType } from 'src/global/entity/enum/contents-type';
import { PlaceReviewReportReason } from 'src/place-review/enum/place-review-report-reason';
import { CreatePlaceReviewRequest } from 'src/place/dto/request/create-place-review-request.dto';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { PatchPlaceReviewRequest } from './dto/request/patch-place-review-request.dto';
import { ReportPlaceReviewRequest } from './dto/request/report-place-review-request.dto';
import { PatchPlaceReviewResponse } from './dto/response/patch-place-review-response.dto';
import { ReportPlaceReviewResponse } from './dto/response/report-place-review-response.dto';
import { PlaceReviewImage } from './entity/place-review-image.entity';
import { PlaceReview } from './entity/place-review.entity';

@Injectable()
export class PlaceReviewConverter implements OnModuleInit {
  private static staticS3Service: S3Service;

  constructor(private readonly s3Service: S3Service) {}
  onModuleInit() {
    PlaceReviewConverter.staticS3Service = this.s3Service;
  }

  public static async toPlaceReview(
    request: CreatePlaceReviewRequest,
    author: User,
    place: Place,
    activity: Activity,
    images: Express.Multer.File[],
  ): Promise<PlaceReview> {
    const placeReviewImages = await Promise.all(
      images.map(async image => {
        const imageUrl = await this.staticS3Service.uploadPlaceReviewImageFile(image);
        return this.toPlaceReviewImage(imageUrl);
      }),
    );

    return Builder<PlaceReview>()
      .activity(activity)
      .author(author)
      .commentAllowed(request.commentAllowed)
      .contents(request.contents)
      .rating(request.rating)
      .visitedAt(request.visitedAt)
      .place(place)
      .images(placeReviewImages)
      .build();
  }

  public static async toUpdatePlaceReview(
    review: PlaceReview,
    request: PatchPlaceReviewRequest,
    activity: Activity,
  ) {
    review.visitedAt = request.visitedAt;
    review.contents = request.contents;
    review.rating = request.rating;
    review.commentAllowed = request.commentAllowed;
    if (activity) {
      review.activity = activity;
    }
    review.images = undefined;

    return review;
  }

  public static toPlaceReviewImage(imageUrl: string): PlaceReviewImage {
    return Builder<PlaceReviewImage>().imageUrl(imageUrl).build();
  }

  public static toContentsReport(
    request: ReportPlaceReviewRequest,
    reporter: User,
    placeReview: PlaceReview,
  ) {
    return Builder(ContentsReport)
      .contentsType(ContentsType.PLACE_REVIEW)
      .placeReivew(placeReview)
      .reason(PlaceReviewReportReason[request.reason])
      .reporter(reporter)
      .build();
  }

  public static toReportPlaceReviewResponse(contentsReport: ContentsReport) {
    return Builder(ReportPlaceReviewResponse)
      .reportedAt(contentsReport.createdAt)
      .reportedPlaceReviewId(contentsReport.placeReivew.reviewId)
      .build();
  }

  public static toPatchPlaceReviewResponse(review: PlaceReview) {
    return Builder(PatchPlaceReviewResponse)
      .updatedReviewId(review.reviewId)
      .updatedAt(review.updatedAt)
      .build();
  }
}
