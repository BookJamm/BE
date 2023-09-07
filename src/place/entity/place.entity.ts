import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';

@Entity('places')
export class Place extends BaseEntity {
  @PrimaryGeneratedColumn()
  placeId: number;

  @Column()
  totalRating: number;

  @Column()
  reviewCount: number;

  @Column()
  category: number;

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

  @Column()
  bookmarkCount: number;

  @OneToOne(() => Address, address => address.place)
  address: Address;
}
