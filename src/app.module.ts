import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import dbConfig from './global/config/db.config';
import jwtConfig from './global/config/jwt.config';
import { TypeOrmConfigService } from './global/config/typeorm-config.service';
import { LoggerMiddleware } from './global/log.middleware';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, jwtConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => new DataSource(options).initialize(),
    }),
    AuthModule,
    UsersModule,
    PlacesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
