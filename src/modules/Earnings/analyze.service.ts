import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// The Sequelize class is imported from the sequelize-typescript package.
import { Op } from 'sequelize';

import { StockProfitModel, StockPriceModel } from './analyze.model';

import type { StockQueryDto } from './analyze.dto';

@Injectable()
export class AnalyzeService {
  constructor(
    @InjectModel(StockProfitModel)
    private stockProfitModel: typeof StockProfitModel,
    @InjectModel(StockPriceModel)
    private stockPriceModel: typeof StockPriceModel,
  ) {}

  async findStockProfit(query: StockQueryDto) {
    const res = await this.stockProfitModel.findAll({
      where: {
        stockCode: {
          [Op.in]: query.stockCode,
        },
        tradeDate: {
          [Op.gte]: query.start_date,
          [Op.lte]: query.end_date,
        },
      },
    });
    return res.map((item) => {
      return {
        tradeDate: item.tradeDate,
        stockCode: item.stockCode,
        profitRatio: item.profitRatio,
      };
    });
  }

  async findStockPrice(query: StockQueryDto) {
    const res = await this.stockPriceModel.findAll({
      where: {
        stockCode: {
          [Op.in]: query.stockCode,
        },
        tradeDate: {
          [Op.gte]: query.start_date,
          [Op.lte]: query.end_date,
        },
      },
    });
    return res.map((item) => {
      return {
        tradeDate: item.tradeDate,
        stockCode: item.stockCode,
        price: item.price,
      };
    });
  }

  async findStock(
    query: StockQueryDto,
    stockCountList: Record<string, number> | null,
  ) {
    const [stockPriceList, stockProfitList] = await Promise.all([
      this.findStockPrice(query),
      this.findStockProfit(query),
    ]);
    console.log(stockPriceList, stockProfitList, stockCountList);
    if (!stockPriceList.length || !stockProfitList.length) {
      throw '未查询到符合条件的股票';
    }
    return {
      x: [],
      y: [],
    };
  }
}
