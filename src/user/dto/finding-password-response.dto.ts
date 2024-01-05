import { ApiProperty } from '@nestjs/swagger';

export class FindingPasswordResponse {
  @ApiProperty({ description: '요청이 완료된 후 이메일 전송 상태', example: true })
  isPasswordSended: boolean;
}
