import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from 'src/activity/entity/activity.entity';
import { S3Service } from 'src/aws/s3/s3.service';
import { ContentsReport } from 'src/global/entity/contents-report.entity';
import { Place } from 'src/place/entity/place.entity';
import { UserReport } from 'src/user/entity/user-report.entity';
import { User } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';
import { PlaceReviewImage } from './entity/place-review-image.entity';
import { PlaceReview } from './entity/place-review.entity';
import { PlaceReviewController } from './place-review.controller';
import { PlaceReviewConverter } from './place-review.converter';
import { PlaceReviewService } from './place-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlaceReview,
      PlaceReviewImage,
      User,
      Place,
      Activity,
      UserReport,
      ContentsReport,
    ]),
    UserModule,
  ],
  controllers: [PlaceReviewController],
  providers: [PlaceReviewService, S3Service, PlaceReviewConverter],
  exports: [PlaceReviewService],
})
export class PlaceReviewModule {}
