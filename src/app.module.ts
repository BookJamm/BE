import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import dbConfig from './global/config/db.config';
import jwtConfig from './global/config/jwt.config';
import s3Config from './global/config/s3.config';
import { TypeOrmConfigService } from './global/config/typeorm-config.service';
import { LoggerMiddleware } from './global/log.middleware';
import { PlaceModule } from './place/place.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, jwtConfig, s3Config],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => new DataSource(options).initialize(),
    }),
    AuthModule,
    UserModule,
    PlaceModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
