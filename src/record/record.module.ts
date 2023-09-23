import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { User } from 'src/user/entity/user.entity';
import { Activity } from 'src/activity/entity/activity.entity';
import { RecordImage } from './entities/record-image.entity';
import { RecordLikes } from './entities/record-like.entity';
import { Place } from 'src/place/entity/place.entity';
import { RecordRepository } from './entities/record.repository';
import { S3Service } from 'src/aws/s3/s3.service';
import { Follow } from 'src/user/entity/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, User, Activity, Place, RecordImage, RecordLikes, Follow]),
  ],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository, S3Service],
})
export class RecordModule {}
