import { PlaceReview } from 'src/place-review/entity/place-review.entity';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity('contents_reports')
export class ContentsReport extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportId: number;

  @Column()
  reason: string;

  @Column()
  contentsType: string;

  @ManyToOne(() => User, user => user.userId)
  @JoinColumn({ name: 'reporter_id', referencedColumnName: 'userId' })
  reporter: User;

  @ManyToOne(() => PlaceReview, review => review.reviewId)
  @JoinColumn({ name: 'place_review_id', referencedColumnName: 'reviewId' })
  placeReivew: PlaceReview;
}
