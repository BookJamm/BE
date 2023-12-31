import { ApiProperty } from '@nestjs/swagger';

export class DeleteReviewResponse {
  @ApiProperty({
    description: '리뷰 삭제 여부 (정상적으로 삭제된 경우 true, false는 존재하지 않음',
  })
  readonly deleted: boolean;
}
