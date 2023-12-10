import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Config } from './config.type';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService<Config>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get('db.host', { infer: true }),
      port: this.configService.get('db.port', { infer: true }),
      username: this.configService.get('db.username', { infer: true }),
      password: this.configService.get('db.password', {
        infer: true,
      }),
      entities: ['dist/**/*.entity.js'],
      database: this.configService.get('db.database', { infer: true }),
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
      bigNumberStrings: false,
    };
  }
}
