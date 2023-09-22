import { BaseImage } from 'src/global/entity/base-image.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ActivityReview } from './activity-review.entity';

@Entity('activity_review_images')
export class ActivityReviewImage extends BaseImage {
  @ManyToOne(() => ActivityReview)
  @JoinColumn({ name: 'review_id', referencedColumnName: 'reviewId' })
  review: ActivityReview;
}
