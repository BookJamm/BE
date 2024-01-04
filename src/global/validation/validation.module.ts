import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { IsEmailAvailableConstraint } from './decorator/is-email-available.decorator';

@Module({
  imports: [AuthModule],
  providers: [IsEmailAvailableConstraint],
})
export class ValidationModule {}
