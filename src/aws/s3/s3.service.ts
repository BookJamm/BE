import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly S3_BASE_URL = 'https://bookjam.s3.ap-northeast-2.amazonaws.com/';
  private readonly DIR = {
    REVIEW: 'review',
  };
  private readonly BUCKET;

  constructor(private readonly configService: ConfigService) {
    const options: S3ClientConfig = {
      credentials: {
        accessKeyId: configService.get('s3.accessKey', { infer: true }),
        secretAccessKey: configService.get('s3.secretAccessKey', { infer: true }),
      },
      region: configService.get('s3.region', { infer: true }),
    };

    this.s3 = new S3Client(options);
    this.BUCKET = configService.get('s3.bucket', { infer: true });
  }

  async uploadFile(key: string, file: Express.Multer.File) {
    const commnad = new PutObjectCommand({
      Bucket: this.configService.get('s3.bucket', { infer: true }),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(commnad);

    return `${this.S3_BASE_URL}${key}`;
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Key: key,
      Bucket: this.BUCKET,
    });

    await this.s3.send(command);
  }

  generateReviewKeyName(originalFileName: string) {
    const uuid = crypto.randomUUID();
    return `${this.DIR.REVIEW}/${uuid}_${originalFileName}`;
  }

  getKeyFromUrl(url: string) {
    return url.split(this.S3_BASE_URL)[1];
  }
}
