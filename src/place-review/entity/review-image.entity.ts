import { BaseImage } from 'src/global/entity/base-image.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Review } from './review.entity';

@Entity('place_review_images')
export class ReviewImage extends BaseImage {
  @ManyToOne(() => Review, review => review.images)
  @JoinColumn({ name: 'review_id', referencedColumnName: 'reviewId' })
  reveiw: Review;

  constructor(imageUrl: string, review: Review) {
    super();
    this.imageUrl = imageUrl;
    this.reveiw = review;
  }

  public static createReviewImage(imageUrl: string, review: Review) {
    return new ReviewImage(imageUrl, review);
  }
}
