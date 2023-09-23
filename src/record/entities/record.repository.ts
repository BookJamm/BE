import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Record } from './record.entity';
import { RecordLIstResponse } from '../dto/record-list-response.dto';
import { RecordImage } from './record-image.entity';
import { Follow } from 'src/user/entity/follow.entity';

@Injectable()
export class RecordRepository extends Repository<Record> {
  constructor(
    @InjectRepository(Record)
    private readonly repository: Repository<Record>,
    @InjectRepository(RecordImage)
    private readonly imageRepository: Repository<RecordImage>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async findFriendRecordsByFriendId(
    friendId: number,
    last?: number,
  ): Promise<RecordLIstResponse[]> {
    const query = this.repository.createQueryBuilder('cr');
    query
      .select([
        'cr.record_id as recordId',
        'cr.author as author',
        'cr.created_at as createdAt',
        'cr.status as status',
        'cr.date as date',
        'cr.place_id as placeId',
        'places.name as placeName',
        'places.category as category',
        'cr.isbn as isbn',
        'cr.activities as activity',
        'cr.emotions as emotions',
        'cr.contents as contents',
        'cr.comment_not_allowed as commentNotAllowed',
        'cr.comment_count as commentCount',
        'cr.like_count as likeCount',
      ])
      .leftJoin('places', 'places', 'cr.place_id = places.place_id')
      .where('cr.isNotPublic = 0 and cr.author = :friendId', { friendId });

    if (last) {
      query.andWhere('cr.created_at < (select created_at FROM records WHERE record_id = :last)', {
        last,
      });
    }

    query.groupBy('cr.record_id').orderBy('cr.created_at', 'DESC').limit(10);

    const records = (await query.getRawMany()).map(res => plainToInstance(RecordLIstResponse, res));

    for (const record of records) {
      const images = await this.imageRepository
        .createQueryBuilder('i')
        .select(['image_url'])
        .where('i.record_id = :record_id', {
          record_id: record.recordId,
        })
        .getRawMany();

      record.imagesUrls = images.map(img => img.image_url);
    }

    return records;
  }

  public async findAllFriendRecords(userId: number, last?: number): Promise<RecordLIstResponse[]> {
    const friendsList = await this.followRepository
      .createQueryBuilder('f')
      .select('followee')
      .where('f.follower = :userId', { userId })
      .getRawMany();
    let friends = [];
    for (const friend of friendsList) {
      friends.push(Number(friend.followee));
    }
    const query = this.repository.createQueryBuilder('cr');
    query
      .select([
        'cr.record_id as recordId',
        'cr.author as author',
        'cr.created_at as createdAt',
        'cr.status as status',
        'cr.date as date',
        'cr.place_id as placeId',
        'places.name as placeName',
        'places.category as category',
        'cr.isbn as isbn',
        'cr.activities as activity',
        'cr.emotions as emotions',
        'cr.contents as contents',
        'cr.comment_not_allowed as commentNotAllowed',
        'cr.comment_count as commentCount',
        'cr.like_count as likeCount',
      ])
      .leftJoin('places', 'places', 'cr.place_id = places.place_id')
      .where('cr.isNotPublic = 0 and cr.author in (:friends)', { friends });

    if (last) {
      query.andWhere('cr.created_at < (select created_at FROM records WHERE record_id = :last)', {
        last,
      });
    }

    query.groupBy('cr.record_id').orderBy('cr.created_at', 'DESC').limit(10);

    const records = (await query.getRawMany()).map(res => plainToInstance(RecordLIstResponse, res));

    for (const record of records) {
      const images = await this.imageRepository
        .createQueryBuilder('i')
        .select(['image_url'])
        .where('i.record_id = :record_id', {
          record_id: record.recordId,
        })
        .getRawMany();

      record.imagesUrls = images.map(img => img.image_url);
    }

    return records;
  }
}
