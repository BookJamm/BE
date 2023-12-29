import { Activity } from 'src/activity/entity/activity.entity';
import { BaseEntity } from 'src/global/base/base.entity';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlaceReviewImage } from './place-review-image.entity';
import { PlaceReviewStatus } from './place-review-status';

@Entity('place_reviews')
export class PlaceReview extends BaseEntity {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @Column()
  visitedAt: Date;

  @Column()
  contents: string;

  @Column({ enum: PlaceReviewStatus })
  status: PlaceReviewStatus;

  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'tinyint' })
  commentAllowed: boolean;

  @ManyToOne(() => User, author => author.userId)
  @JoinColumn({ name: 'author', referencedColumnName: 'userId' })
  author: User;

  @OneToOne(() => Activity, activity => activity.activityId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id', referencedColumnName: 'activityId' })
  activity: Activity;

  @ManyToOne(() => Place, place => place.placeId)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;

  @OneToMany(() => PlaceReviewImage, reviewImage => reviewImage.review, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images: PlaceReviewImage[];
}
