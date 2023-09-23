import { Activity } from 'src/activity/entity/activity.entity';
import { BaseEntity } from 'src/global/base/base.entity';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RecordImage } from './record-image.entity';
import { RecordLike } from './record-like.entity';

@Entity('records')
export class Record extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  recordId: number;

  @ManyToOne(() => User, author => author.records)
  @JoinColumn({ name: 'author', referencedColumnName: 'userId' })
  @Column({ type: 'bigint' })
  author: User;

  @Column({ type: 'int' })
  status: number;

  @Column()
  date: Date;

  @ManyToOne(() => Place, place => place.records)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  places: Place;

  @Column()
  isbn: string;

  @ManyToOne(() => Activity, activity => activity.records)
  @JoinColumn({ name: 'activities', referencedColumnName: 'activityId' })
  activities: Activity;

  @Column({ type: 'int' })
  emotions: number;

  @Column()
  contents: string;

  @Column()
  commentNotAllowed: boolean;

  @Column({ type: 'bigint' })
  commentCount: number;

  @Column({ type: 'bigint' })
  likeCount: number;

  @Column()
  isNotPublic: boolean;

  @OneToMany(() => RecordImage, recordImages => recordImages.record)
  @JoinColumn({ name: 'images', referencedColumnName: 'imageUrl' })
  images: RecordImage[];

  @OneToMany(() => RecordLike, recordlikes => recordlikes.record)
  likes: RecordLike[];

  constructor(
    author: User,
    place: Place,
    isbn: string,
    date: Date,
    emotions: number,
    activities: Activity,
    contents: string,
    commentNotAllowed: boolean,
    commentCount: number,
    likeCount: number,
    isNotPublic: boolean,
  ) {
    super();
    this.author = author;
    this.date = date;
    this.places = place;
    this.isbn = isbn;
    this.activities = activities;
    this.emotions = emotions;
    this.contents = contents;
    this.commentNotAllowed = commentNotAllowed;
    this.commentCount = commentCount;
    this.likeCount = likeCount;
    this.isNotPublic = isNotPublic;
  }

  public static createRecord(
    author: User,
    date: Date,
    place: Place,
    isbn: string,
    activities: Activity,
    emotions: number,
    contents: string,
    commentNotAllowed: boolean,
    commentCount: number,
    likeCount: number,
    isNotPublic: boolean,
  ): Record {
    return new Record(
      author,
      place,
      isbn,
      date,
      emotions,
      activities,
      contents,
      commentNotAllowed,
      commentCount,
      likeCount,
      isNotPublic,
    );
  }
}
