import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { Follow } from './entity/follow.entity';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow])],
  providers: [UserService, S3Service],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
