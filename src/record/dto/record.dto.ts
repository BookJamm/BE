import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsBoolean()
  isNotPublic: boolean;

  @IsBoolean()
  commentNotAllowed: boolean;
}
