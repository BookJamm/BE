import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from 'src/activity/activity.module';
import { PlaceReviewImage } from 'src/place-review/entity/place-review-image.entity';
import { PlaceReviewModule } from 'src/place-review/place-review.module';
import { PlaceHour } from './entity/place-hour.entity';
import { PlaceNews } from './entity/place-news.entity';
import { Place } from './entity/place.entity';
import { PlaceRepository } from './entity/place.repository';
import { PlaceController } from './place.controller';
import { PlaceConverter } from './place.converter';
import { PlaceService } from './place.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, PlaceReviewImage, PlaceHour, PlaceNews]),
    PlaceReviewModule,
    forwardRef(() => ActivityModule),
  ],
  controllers: [PlaceController],
  providers: [PlaceService, PlaceRepository, PlaceConverter],
  exports: [],
})
export class PlaceModule {}
