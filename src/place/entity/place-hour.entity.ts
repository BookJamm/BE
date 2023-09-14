import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Place } from './place.entity';

enum Day {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

@Entity('place_hours')
export class PlaceHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('enum', { enum: Day })
  day: Day;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @ManyToOne(() => Place, place => place.hours)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;
}
