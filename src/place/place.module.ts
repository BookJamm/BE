import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewModule } from 'src/review/review.module';
import { Place } from './entity/place.entity';
import { PlaceRepository } from './entity/place.repository';
import { PlaceFindService } from './place-find.service';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place]), forwardRef(() => ReviewModule)],
  controllers: [PlaceController],
  providers: [PlaceService, PlaceRepository, PlaceFindService],
  exports: [PlaceFindService],
})
export class PlaceModule {}
