import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from 'src/activity/activity.module';
import { ReviewImage } from 'src/place-review/entity/review-image.entity';
import { ReviewModule } from 'src/place-review/review.module';
import { PlaceBookmark } from './entity/place-bookmark.entity';
import { PlaceHour } from './entity/place-hour.entity';
import { Place } from './entity/place.entity';
import { PlaceRepository } from './entity/place.repository';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, ReviewImage, PlaceHour, PlaceBookmark]),
    ReviewModule,
    forwardRef(() => ActivityModule),
  ],
  controllers: [PlaceController],
  providers: [PlaceService, PlaceRepository],
  exports: [],
})
export class PlaceModule {}
