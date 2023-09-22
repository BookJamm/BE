import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from 'src/place/entity/place.entity';
import { PlaceModule } from 'src/place/place.module';
import { UserModule } from 'src/user/user.module';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityLike } from './entity/activity-like.entity';
import { ActivityReview } from './entity/activity-review.entity';
import { Activity } from './entity/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Place, ActivityLike, ActivityReview]),
    forwardRef(() => PlaceModule),
    UserModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
