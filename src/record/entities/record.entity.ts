import { Activity } from 'src/activity/entity/activity.entity';
import { BaseEntity } from 'src/global/base/base.entity';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RecordImage } from './record-image.entity';
import { RecordLikes } from './record-like.entity';

@Entity('records')
export class Record extends BaseEntity {
  @PrimaryGeneratedColumn()
  recordId: number;

  @ManyToOne(() => User, author => author.records)
  @JoinColumn({ name: 'author', referencedColumnName: 'userId' })
  author: User;

  @Column()
  status: number;

  @Column()
  date: Date;

  @ManyToOne(() => Place, place => place.records)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;

  @Column()
  isbn: string;

  @ManyToOne(() => Activity, activity => activity.records)
  @JoinColumn({ name: 'activities', referencedColumnName: 'activityId' })
  activities: Activity;

  @Column()
  emotions: number;

  @Column()
  contents: string;

  @Column()
  commentNotAllowed: number;

  @Column()
  commentCount: number;

  @Column()
  likeCount: number;

  @Column()
  isNotPublic: number;

  @OneToMany(() => RecordImage, recordImages => recordImages.record)
  @JoinColumn({ name: 'images' })
  images: RecordImage[];

  @OneToMany(() => RecordLikes, recordlikes => recordlikes.record)
  likes: RecordLikes[];

  constructor(
    author: User,
    place: Place,
    isbn: string,
    date: Date,
    emotions: number,
    activities: Activity,
    contents: string,
    isNotPublic: number,
    commentNotAllowed: number,
    commentCount: number,
    likeCount: number,
  ) {
    super();
    this.author = author;
    this.date = date;
    this.place = place;
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
    commentNotAllowed: number,
    commentCount: number,
    likeCount: number,
    isNotPublic: number,
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
