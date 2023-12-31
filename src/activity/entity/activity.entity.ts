import { Place } from 'src/place/entity/place.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activities')
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn()
  activityId: number;

  @Column()
  title: string;

  @Column()
  info: string;

  @Column()
  capacity: number;

  @Column()
  headcount: number;

  @Column()
  totalRating: number;

  @Column()
  imageUrl: string;

  @Column()
  likeCount: number;

  @Column()
  reviewCount: number;

  @ManyToOne(() => Place, place => place.activities)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;
}
