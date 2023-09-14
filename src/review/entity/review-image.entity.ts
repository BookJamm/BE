import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Review } from './review.entity';

@Entity('place_review_images')
export class ReviewImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Review, review => review.images)
  @JoinColumn({ name: 'review_id', referencedColumnName: 'reviewId' })
  reveiw: Review;

  constructor(imageUrl: string, review: Review) {
    this.imageUrl = imageUrl;
    this.reveiw = review;
  }

  public static createReviewImage(imageUrl: string, review: Review) {
    return new ReviewImage(imageUrl, review);
  }
}
