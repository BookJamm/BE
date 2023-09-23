import { Injectable } from '@nestjs/common';
import { Record } from './entities/record.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { Place } from 'src/place/entity/place.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordImage } from './entities/record-image.entity';
import { RecordLikes } from './entities/record-like.entity';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { Activity } from 'src/activity/entity/activity.entity';
import { ActivityResponseCode } from 'src/activity/exception/activity-response-code';
import { RecordRepository } from './entities/record.repository';
import { RecordDto } from './dto/record.dto';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly recordRepository: RecordRepository,
    @InjectRepository(RecordImage)
    private readonly recordImageRepository: Repository<RecordImage>,
    @InjectRepository(RecordLikes)
    private readonly recordLikesRepository: Repository<RecordLikes>,
    private readonly s3Service: S3Service,
  ) {}

  async getFriendsRecords() {}
  async postRecordImages() {}
  async postRecord(userId: number, recordDto: RecordDto) {
    const author: User = await this.userRepository.findOneBy({ userId: userId });
    if (!author) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }
    const place: Place = await this.placeRepository.findOneBy({ placeId: recordDto.place });
    if (!place) {
      throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
    }
    const activity: Activity = await this.activityRepository.findOneBy({
      activityId: recordDto.activity,
    });
    if (!activity) {
      throw BaseException.of(ActivityResponseCode.ACTIVITY_NOT_FOUND);
    }
    const record: Record = new Record(
      author,
      place,
      recordDto.isbn,
      recordDto.date,
      recordDto.emotions,
      activity,
      recordDto.contents,
      recordDto.isNotPublic,
      recordDto.commentNotAllowed,
      recordDto.commentCount,
      recordDto.likeCount,
    );
    await this.recordRepository.save(record);
    return { created: true, recordId: record.recordId };
  }
  async putRecord() {}
  async deleteRecordImages() {}
  async patchComment() {}
}
