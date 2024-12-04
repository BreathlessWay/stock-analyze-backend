import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AnalyzeController } from './analyze.controller';
import { UserModel } from '../Users/user.model';
import { UserService } from '../Users/user.service';

@Module({
  imports: [ConfigModule, SequelizeModule.forFeature([UserModel])],
  controllers: [AnalyzeController],
  providers: [UserService],
})
export class AnalyzeModule {}
