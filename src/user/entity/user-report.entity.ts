import { BaseEntity } from 'src/global/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_reports')
export class UserReport extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportId: number;

  @Column()
  reason: string;

  @ManyToOne(() => User, user => user.userId)
  @JoinColumn({ name: 'reporter_id', referencedColumnName: 'userId' })
  reporter: User;

  @ManyToOne(() => User, user => user.userId)
  @JoinColumn({ name: 'target_user_id', referencedColumnName: 'userId' })
  targetUser: User;
}
