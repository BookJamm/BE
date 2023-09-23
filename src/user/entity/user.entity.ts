import { BaseEntity } from 'src/global/base/base.entity';
import { Review } from 'src/place-review/entity/review.entity';
import { PlaceBookmark } from 'src/place/entity/place-bookmark.entity';
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Follow } from './follow.entity';
import { Password } from './password';
import { RecordLikes } from 'src/record/entities/record-like.entity';
import { Record } from 'src/record/entities/record.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  email: string;

  @Column(() => Password, { prefix: false })
  password: Password;

  @Column()
  profileImage: string;

  @Column()
  username: string;

  @DeleteDateColumn()
  disabledAt: Date;

  @Column()
  refreshToken: string;

  @OneToMany(() => Review, review => review.author)
  reviews: Review[];

  @OneToMany(() => Follow, follow => follow.follower)
  followings: Follow[];

  @OneToMany(() => Follow, follow => follow.followee)
  followers: Follow[];

  @OneToMany(() => PlaceBookmark, bookmark => bookmark.bookmarker)
  bookmarks: PlaceBookmark[];

  @OneToMany(() => Record, record => record.author)
  records: Record[];

  @OneToMany(() => RecordLikes, recordLikes => recordLikes.liker)
  likes: RecordLikes[];

  constructor(email: string, password: Password, username: string) {
    super();
    this.email = email;
    this.password = password;
    this.username = username;
  }

  public static createUser(email: string, password: Password, username: string): User {
    return new User(email, password, username);
  }
}
