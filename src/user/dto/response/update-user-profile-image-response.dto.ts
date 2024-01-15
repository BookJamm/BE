import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileImageResponse {
  @ApiProperty({ description: '수정된 시간', example: new Date() })
  updatedAt: Date;

  @ApiProperty({ description: '수정된 프로필 이미지 URL' })
  updatedProfileImageUrl: string;
}
