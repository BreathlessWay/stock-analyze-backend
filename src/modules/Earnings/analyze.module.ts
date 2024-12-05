import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { StockPriceModel, StockProfitModel } from './analyze.model';

import { UserModel } from '../Users/user.model';
import { UserService } from '../Users/user.service';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([UserModel, StockPriceModel, StockProfitModel]),
  ],
  controllers: [AnalyzeController],
  providers: [UserService, AnalyzeService],
})
export class AnalyzeModule {}
