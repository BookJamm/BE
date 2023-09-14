import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Place } from './place.entity';

@Entity('place_address')
export class PlaceAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jibun: string;

  @Column()
  road: string;

  @OneToOne(() => Place, place => place.address)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;
}
