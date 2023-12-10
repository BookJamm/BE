import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';
import { PlaceReviewImage } from './entity/place-review-image.entity';
import { PlaceReview } from './entity/place-review.entity';
import { PlaceReviewController } from './place-review.controller';
import { PlaceReviewService } from './place-review.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceReview, PlaceReviewImage, User, Place]), UserModule],
  controllers: [PlaceReviewController],
  providers: [PlaceReviewService, S3Service],
  exports: [PlaceReviewService],
})
export class PlaceReviewModule {}
