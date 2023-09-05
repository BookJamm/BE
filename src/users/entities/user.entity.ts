import { BaseEntity } from 'src/global/base/base.entity';
import {
 Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn 
} from 'typeorm';
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
