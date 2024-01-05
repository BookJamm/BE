import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PlaceReviewReportReason } from 'src/place-review/enum/place-review-report-reason';

export class ReportPlaceReviewRequest {
  @ApiProperty({ description: '신고 사유', enum: PlaceReviewReportReason })
  @IsNotEmpty({ message: '신고 사유는 필수입니다.' })
  @IsEnum(PlaceReviewReportReason, {
    message: `신고 사유는 ${Object.keys(PlaceReviewReportReason)} 중 하나여야 합니다.`,
  })
  readonly reason: string;
}
