import { BaseEntity } from 'src/global/base/base.entity';
import { Place } from 'src/place/entity/place.entity';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewStatus } from './review-status';

@Entity('place_reviews')
export class Review extends BaseEntity {
  @PrimaryGeneratedColumn()
  reviewId: string;

  @Column()
  visitedAt: Date;

  @Column()
  contents: string;

  @Column({ enum: ReviewStatus })
  status: ReviewStatus;

  @Column({ type: 'float' })
  rating: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author', referencedColumnName: 'userId' })
  author: User;

  @ManyToOne(() => Place)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;

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
