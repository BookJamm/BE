import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordLIstResponse {
  @IsNumber()
  readonly recordId: number;

  @IsNumber()
  readonly author: number;

  @IsDate()
  readonly createdAt: Date;

  @IsNumber()
  readonly status: number;

  @IsDate()
  readonly date: Date;

  @IsNumber()
  @IsOptional()
  readonly placeId: number;

  @IsString()
  @IsOptional()
  readonly placeName: string;

  @IsNumber()
  @IsOptional()
  readonly category: number;

  @IsString()
  @IsOptional()
  readonly isbn: string;

  @IsNumber()
  @IsOptional()
  readonly activity: number;

  @IsNumber()
  readonly emotions: number;

  @IsString()
  readonly contents: string;

  @IsBoolean()
  readonly commentNotAllowed: boolean;

  @IsBoolean()
  readonly isNotPublic: boolean;

  @IsNumber()
  readonly commentCount: number;

  @IsNumber()
  readonly likeCount: number;

  @IsArray()
  @IsOptional()
  imagesUrls: string[];
}
