import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { IsEmailTakenConstraint } from './decorator/is-email-taken.decorator';

@Module({
  imports: [AuthModule],
  providers: [IsEmailTakenConstraint],
})
export class ValidationModule {}
