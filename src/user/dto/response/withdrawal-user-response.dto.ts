import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalUserResponse {
  @ApiProperty({ description: '회원 탈퇴 여부', example: true })
  isUserWithdraw: boolean;
}
