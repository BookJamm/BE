import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordDto {
  @IsNumber()
  @IsOptional()
  place: number;

  @IsString()
  @IsOptional()
  isbn: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  emotions: number;

  @IsNumber()
  @IsOptional()
  activity: number;

  @IsString()
  @IsNotEmpty()
  contents: string;

  @IsNumber()
  isNotPublic: number;

  @IsNumber()
  commentNotAllowed: number;

  commentCount: number = 0;
  likeCount: number = 0;
}
