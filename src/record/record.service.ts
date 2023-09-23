import { Injectable } from '@nestjs/common';
import { Record } from './entities/record.entity';
import { User } from 'src/user/entity/user.entity';
import { Like, Raw, Repository } from 'typeorm';
import { Place } from 'src/place/entity/place.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordImage } from './entities/record-image.entity';
import { RecordLike } from './entities/record-like.entity';
import { S3Service } from 'src/aws/s3/s3.service';
import { BaseException } from 'src/global/base/base-exception';
import { UserResponseCode } from 'src/user/exception/user-response-code';
import { PlaceResponseCode } from 'src/place/exception/place-response-code';
import { Activity } from 'src/activity/entity/activity.entity';
import { ActivityResponseCode } from 'src/activity/exception/activity-response-code';
import { RecordRepository } from './entities/record.repository';
import { RecordDto } from './dto/record.dto';
import { Follow } from 'src/user/entity/follow.entity';
import { RecordLIstResponse } from './dto/record-list-response.dto';

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
    @InjectRepository(RecordLike)
    private readonly recordLikesRepository: Repository<RecordLike>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly s3Service: S3Service,
  ) {}

  async getFriendsRecords(userId: number, friendId?: number, last?: number) {
    const user: User = await this.userRepository.findOneBy({ userId: userId });
    if (!user) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }
    if (friendId) {
      const friend: User = await this.userRepository.findOneBy({ userId: friendId });
      if (!friend) {
        throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
      }
      const chkFollow: Follow = await this.followRepository.findOneBy({
        follower: { userId },
        followee: { userId: friendId },
      });
      if (!chkFollow) {
        throw BaseException.of(UserResponseCode.NOT_FOLLOWING_USER);
      }
      const friendRecords: RecordLIstResponse[] =
        await this.recordRepository.findFriendRecordsByFriendId(friendId, last);
      return friendRecords;
    } else {
      const friendRecords: RecordLIstResponse[] = await this.recordRepository.findAllFriendRecords(
        userId,
        last,
      );
      return friendRecords;
    }
  }
  async postRecordImages() {}
  async postRecord(userId: number, recordDto: RecordDto) {
    const author: User = await this.userRepository.findOneBy({ userId: userId });
    if (!author) {
      throw BaseException.of(UserResponseCode.USER_NOT_FOUND);
    }
    let place: Place = new Place();
    let activity: Activity = new Activity();
    if (recordDto.place) {
      place = await this.placeRepository.findOneBy({ placeId: recordDto.place });
      if (!place) {
        throw BaseException.of(PlaceResponseCode.PLACE_NOT_FOUND);
      }
    }
    if (recordDto.activity) {
      activity = await this.activityRepository.findOneBy({
        activityId: recordDto.activity,
      });
      if (!activity) {
        throw BaseException.of(ActivityResponseCode.ACTIVITY_NOT_FOUND);
      }
    }
    const record: Record = new Record(
      author,
      place,
      recordDto.isbn,
      recordDto.date,
      recordDto.emotions,
      activity,
      recordDto.contents,
      recordDto.commentNotAllowed,
      0,
      0,
      recordDto.isNotPublic,
    );
    await this.recordRepository.save(record);
    return { recordId: record.recordId };
  }
  async putRecord() {}
  async deleteRecordImages() {}
  async patchComment() {}
}
