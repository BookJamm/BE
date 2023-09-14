import { ApiProperty } from '@nestjs/swagger';

export class FollowResponse {
  @ApiProperty({ description: '요청이 완료된 후 팔로우 상태', example: true })
  following: boolean;
}
