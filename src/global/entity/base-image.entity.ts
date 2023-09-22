import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;
}
