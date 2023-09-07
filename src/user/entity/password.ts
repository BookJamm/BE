import * as bcrypt from 'bcrypt';
import { Column } from 'typeorm';

export class Password {
  public static readonly PASSWORD_PATTERN: RegExp =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#%^&*()_+\-=\[\]{}|;':",./<>?~`\\])[A-Za-z\d!@#%^&*()_+\-=\[\]{}|;':",./<>?~`\\]{9,16}/;

  private static readonly SALT = 10;

  @Column({ name: 'password' })
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  public static async encrpyt(value: string): Promise<Password> {
    return new Password(await bcrypt.hash(value, this.SALT));
  }

  public async isSamePassword(compare: string): Promise<boolean> {
    return bcrypt.compare(compare, this.value);
  }
}
