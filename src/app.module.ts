import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { SequelizeModule } from '@nestjs/sequelize';
import { CacheModule } from '@nestjs/cache-manager';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './modules/Users/user.module';
import { AnalyzeModule } from './modules/Earnings/analyze.module';

import { LoggerMiddleware } from './middlewares/logger.middleware';

import { Upload_Folder_Path } from './constants';

import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PROJECT_PORT: Joi.number().port().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          dialect: 'mysql',
          host: configService.get('DATABASE_HOST'),
          port: +configService.get('DATABASE_PORT'),
          username: configService.get('DATABASE_USER'),
          password: configService.get('DATABASE_PASSWORD'),
          database: 'db',
          synchronize: process.env.NODE_ENV === 'production',
          autoLoadModels: true,
        };
      },
      inject: [ConfigService],
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: Upload_Folder_Path,
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60,
    }),
    UserModule,
    AnalyzeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
