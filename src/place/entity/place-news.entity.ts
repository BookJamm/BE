import { BaseEntity } from 'src/global/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Place } from './place.entity';

@Entity('place_news')
export class PlaceNews extends BaseEntity {
  @PrimaryGeneratedColumn()
  newsId: number;

  @Column()
  title: string;

  @Column()
  contents: string;

  @ManyToOne(() => Place, place => place.news)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;
}
