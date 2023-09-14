import { ApiProperty } from '@nestjs/swagger';

export class JwtResponse {
  @ApiProperty({
    description: 'Access Token',
    example: 'eyJhbGci...',
  })
  readonly accessToken: string;

  @ApiProperty({
    description: 'Refresh Token',
    example: 'eyJhbGci...',
  })
  readonly refreshToken: string;
}
