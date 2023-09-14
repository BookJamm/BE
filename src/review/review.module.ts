import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { ReviewImage } from './entity/review-image.entity';
import { Review } from './entity/review.entity';
import { ReviewRepository } from './entity/review.repository';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewImage, User, Place])],
  controllers: [ReviewController],
  providers: [ReviewService, S3Service, ReviewRepository],
  exports: [ReviewService],
})
export class ReviewModule {}
