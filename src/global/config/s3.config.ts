import { registerAs } from '@nestjs/config';
import { S3Config } from './config.type';

export default registerAs<S3Config>('s3', () => ({
  accessKey: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION,
}));
