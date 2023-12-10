import { BaseEntity } from 'src/global/base/base.entity';
import { PlaceReview } from 'src/place-review/entity/place-review.entity';
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SocialType } from '../enum/social-type';
import { Follow } from './follow.entity';
import { Password } from './password';

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

  @Column({ type: 'enum', enum: SocialType })
  socialType: SocialType;

  @Column()
  socialId: string;

  @OneToMany(() => PlaceReview, review => review.author)
  reviews: PlaceReview[];

  @OneToMany(() => Follow, follow => follow.follower)
  followings: Follow[];

  @OneToMany(() => Follow, follow => follow.followee)
  followers: Follow[];

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
