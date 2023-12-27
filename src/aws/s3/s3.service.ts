import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { BaseException } from 'src/global/base/base-exception';
import { S3ResponseCode } from './exception/s3-response-code';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly S3_BASE_URL: string;
  private readonly DIR = {
    PLACE_REVIEW: 'place-review',
    PROFILE: 'profile',
  };
  private readonly BUCKET: string;
  private readonly logger: Logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.BUCKET = configService.get('s3.bucket', { infer: true });
    const REGION = configService.get('s3.region', { infer: true });

    const options: S3ClientConfig = {
      credentials: {
        accessKeyId: configService.get('s3.accessKey', { infer: true }),
        secretAccessKey: configService.get('s3.secretAccessKey', { infer: true }),
      },
      region: configService.get('s3.region', { infer: true }),
    };

    this.s3 = new S3Client(options);
    this.S3_BASE_URL = `https://${this.BUCKET}.s3.${REGION}.amazonaws.com/`;
  }

  async uploadPlaceReviewImageFile(file: Express.Multer.File) {
    return this.uploadFile(this.DIR.PLACE_REVIEW, file);
  }

  async uploadProfileImageFile(file: Express.Multer.File) {
    return this.uploadFile(this.DIR.PROFILE, file);
  }

  private async uploadFile(dir: string, file: Express.Multer.File) {
    const key = this.generateKeyName(dir, file.originalname);

    const commnad = new PutObjectCommand({
      Bucket: this.BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    try {
      await this.s3.send(commnad);
    } catch (error) {
      this.logger.error('S3에 파일 업로드 실패', error.stack);
      throw BaseException.of(S3ResponseCode.UPLOAD_FAILED);
    }

    return `${this.S3_BASE_URL}${key}`;
  }

  async deleteFileByUrl(url: string) {
    const key = this.getKeyFromUrl(url);
    this.deleteFile(key);
  }

  private async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Key: key,
      Bucket: this.BUCKET,
    });

    try {
      await this.s3.send(command);
    } catch (error) {
      this.logger.error('S3 파일 삭제 실패', error.stack);
      throw BaseException.of(S3ResponseCode.DELETE_FAILED);
    }
  }

  private generateKeyName(dir: string, originalFileName: string) {
    const uuid = crypto.randomUUID();
    return `${dir}/${uuid}_${originalFileName}`;
  }

  getKeyFromUrl(url: string) {
    return url.split(this.S3_BASE_URL)[1];
  }
}
