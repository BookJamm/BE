import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserReportReason } from 'src/user/enum/user-report-reason';

export class ReportUserReqeust {
  @ApiProperty({ description: '신고 사유', enum: Object.keys(UserReportReason) })
  @IsNotEmpty({ message: '신고 사유는 필수입니다.' })
  @IsEnum(UserReportReason, {
    message: `신고 사유는 ${Object.keys(UserReportReason)} 중 하나입니다.`,
  })
  readonly reason: string;
}
