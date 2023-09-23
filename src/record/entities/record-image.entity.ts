import { BaseImage } from 'src/global/entity/base-image.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Record } from './record.entity';

@Entity('record_images')
export class RecordImage extends BaseImage {
  @ManyToOne(() => Record, record => record.images)
  record: Record;

  constructor(imageUrl: string, record: Record) {
    super();
    this.imageUrl = imageUrl;
    this.record = record;
  }

  public static createReviewImage(imageUrl: string, record: Record): RecordImage {
    return new RecordImage(imageUrl, record);
  }
}
