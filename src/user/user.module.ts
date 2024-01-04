import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { UserExistsValidationPipe } from 'src/global/validation/pipe/user-exists-validation.pipe';
import { UserReport } from './entity/user-report.entity';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserConverter } from './user.converter';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserReport])],
  providers: [UserService, S3Service, UserConverter, UserExistsValidationPipe],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
