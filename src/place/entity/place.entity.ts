import { Activity } from 'src/activity/entity/activity.entity';
import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PlaceAddress } from './place-address.entity';
import { PlaceHour } from './place-hour.entity';
import { PlaceNews } from './place-news.entity';

@Entity('places')
export class Place extends BaseEntity {
  @PrimaryGeneratedColumn()
  placeId: number;

  @Column()
  totalRating: number;

  @Column()
  reviewCount: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  website: string;

  @Column()
  lat: number;

  @Column()
  lon: number;

  @OneToOne(() => PlaceAddress, address => address.place)
  address: PlaceAddress;

  @OneToMany(() => PlaceHour, hour => hour.place)
  hours: PlaceHour[];

  @OneToMany(() => PlaceNews, news => news.place)
  news: PlaceNews[];

  @OneToMany(() => Activity, activity => activity.place)
  activities: Activity[];
}
