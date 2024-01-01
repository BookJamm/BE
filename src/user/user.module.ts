import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserConverter } from './user.converter';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, S3Service, UserConverter],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
