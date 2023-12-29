import { BaseImage } from 'src/global/entity/base-image.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PlaceReview } from './place-review.entity';

@Entity('place_review_images')
export class PlaceReviewImage extends BaseImage {
  @ManyToOne(() => PlaceReview, review => review.images)
  @JoinColumn({ name: 'review_id', referencedColumnName: 'reviewId' })
  review: PlaceReview;
}
