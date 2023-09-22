import { User } from 'src/user/entity/user.entity';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Activity } from './activity.entity';

@Entity('activity_likes')
export class ActivityLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Activity)
  @JoinColumn({ name: 'activity_id', referencedColumnName: 'activityId' })
  activity: Activity;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'liker', referencedColumnName: 'userId' })
  user: User;

  @CreateDateColumn()
  likedAt: Date;
}
