import { IsArray, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordLIstResponse {
  @IsNumber()
  recordId: number;

  @IsNumber()
  author: number;

  @IsDate()
  createdAt: Date;

  @IsNumber()
  status: number;

  @IsDate()
  date: Date;

  @IsNumber()
  placeId: number;

  @IsString()
  placeName: string;

  @IsNumber()
  category: number;

  @IsString()
  isbn: string;

  @IsNumber()
  activity: number;

  @IsNumber()
  emotions: number;

  @IsString()
  contents: string;

  @IsNumber()
  commentNotAllowed: number;

  @IsNumber()
  commentCount: number;

  @IsNumber()
  likeCount: number;

  @IsArray()
  @IsOptional()
  imagesUrls: string[];
}
