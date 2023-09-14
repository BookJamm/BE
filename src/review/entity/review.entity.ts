import { BaseEntity } from 'src/global/base/base.entity';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewImage } from './review-image.entity';
import { ReviewStatus } from './review-status';

@Entity('place_reviews')
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @Column()
  visitedAt: Date;

  @Column()
  contents: string;

  @Column({ enum: ReviewStatus })
  status: ReviewStatus;

  @Column({ type: 'float' })
  rating: number;

  @ManyToOne(() => User, author => author.userId)
  @JoinColumn({ name: 'author', referencedColumnName: 'userId' })
  author: User;

  @ManyToOne(() => Place, place => place.placeId)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;

  @OneToMany(() => ReviewImage, reviewImage => reviewImage.reveiw)
  images: ReviewImage[];

  constructor(visitedAt: Date, contents: string, rating: number, place: Place, author: User) {
    super();
    this.visitedAt = visitedAt;
    this.contents = contents;
    this.rating = rating;
    this.place = place;
    this.author = author;
  }

  public static createReview(
    visitedAt: Date,
    contents: string,
    rating: number,
    place: Place,
    author: User,
  ): Review {
    return new Review(visitedAt, contents, rating, place, author);
  }
}
