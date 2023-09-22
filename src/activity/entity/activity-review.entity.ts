import { BaseEntity } from 'src/global/base/base.entity';
import { ReviewStatus } from 'src/place-review/entity/review-status';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ActivityReviewImage } from './activity-review-image.entity';
import { Activity } from './activity.entity';

@Entity('activity_reviews')
export class ActivityReview extends BaseEntity {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @Column()
  visitedAt: Date;

  @Column()
  contents: string;

  @Column({ enum: ReviewStatus })
  status: ReviewStatus;

  @Column()
  rating: number;

  @OneToMany(() => ActivityReviewImage, image => image.review)
  images: ActivityReviewImage[];

  @ManyToOne(() => Activity)
  @JoinColumn({ name: 'activity_id', referencedColumnName: 'activityId' })
  activity: Activity;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author', referencedColumnName: 'userId' })
  author: User;
}
