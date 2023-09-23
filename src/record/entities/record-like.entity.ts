import { BaseEntity } from 'src/global/base/base.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Record } from './record.entity';
import { User } from 'src/user/entity/user.entity';

@Entity('record_likes')
export class RecordLikes extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Record, record => record.likes)
  record: Record;

  @ManyToOne(() => User, user => user.likes)
  liker: User;

  constructor(record: Record, liker: User) {
    super();
    this.record = record;
    this.liker = liker;
  }

  public static createRecordLike(record: Record, user: User): RecordLikes {
    return new RecordLikes(record, user);
  }
}
