import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('follow')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'follower', referencedColumnName: 'userId' })
  follower: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followee', referencedColumnName: 'userId' })
  followee: User;

  @CreateDateColumn()
  followedAt: Date;

  constructor(follower: User, followee: User) {
    this.follower = follower;
    this.followee = followee;
  }
}
