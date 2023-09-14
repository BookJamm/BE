import { User } from 'src/user/entity/user.entity';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Place } from './place.entity';

@Entity('place_bookmarks')
export class PlaceBookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Place, place => place.bookmarks)
  @JoinColumn({ name: 'place_id', referencedColumnName: 'placeId' })
  place: Place;

  @ManyToOne(() => User, user => user.userId)
  @JoinColumn({ name: 'bookmarker', referencedColumnName: 'userId' })
  bookmarker: User;

  @CreateDateColumn()
  bookmarkedAt: Date;
}
