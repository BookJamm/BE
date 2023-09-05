import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlaceRepository } from './entities/place.repository';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceRepository],
})
export class PlacesModule {}
