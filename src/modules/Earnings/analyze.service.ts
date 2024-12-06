import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// The Sequelize class is imported from the sequelize-typescript package.
import { Op } from 'sequelize';
import BigNumber from 'bignumber.js';

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
      order: [['tradeDate', 'ASC']],
    });
    if (res && res.length) {
      return res.map((item) => {
        return {
          tradeDate: item.tradeDate,
          stockCode: item.stockCode,
          profitRatio: item.profitRatio,
        };
      });
    }
    return [];
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
      order: [['tradeDate', 'ASC']],
    });
    if (res && res.length) {
      return res.map((item) => {
        return {
          tradeDate: item.tradeDate,
          stockCode: item.stockCode,
          price: item.price,
        };
      });
    }
    return [];
  }

  async findStock(
    query: StockQueryDto,
    stockCountList: Record<string, number> | null,
  ) {
    if (stockCountList && query.stockCode.length > 1) {
      const [stockPriceList, stockProfitList] = await Promise.all([
        this.findStockPrice(query),
        this.findStockProfit(query),
      ]);
      if (!stockPriceList.length || !stockProfitList.length) {
        throw '未查询到符合条件的股票';
      }
      const marketValueMap: Record<string, BigNumber> = {};
      const stockMarketValueList = stockPriceList.map((item) => {
        const { tradeDate, stockCode, price } = item;
        const marketValue = new BigNumber(
          stockCountList[stockCode],
        ).multipliedBy(new BigNumber(price));
        if (marketValueMap[tradeDate]) {
          marketValueMap[tradeDate] =
            marketValueMap[tradeDate].plus(marketValue);
        } else {
          marketValueMap[tradeDate] = marketValue;
        }
        const { profitRatio } = stockProfitList.find(
          (_) => _.stockCode === stockCode && _.tradeDate === tradeDate,
        ) || { profitRatio: 0 };
        return {
          tradeDate,
          stockCode,
          marketValue,
          profitRatio,
        };
      });
      const dateMapYieldRate = new Map<
        string,
        {
          stocks: string[];
          yieldRate: BigNumber;
        }
      >();
      stockMarketValueList.forEach((item) => {
        const { tradeDate, marketValue, profitRatio, stockCode } = item;
        const currentDayAllMarketValue = marketValueMap[item.tradeDate];
        const yieldRate = marketValue
          .div(currentDayAllMarketValue)
          .multipliedBy(new BigNumber(profitRatio));
        if (dateMapYieldRate.has(tradeDate)) {
          const { stocks, yieldRate: _y } = dateMapYieldRate.get(tradeDate);
          const v = new BigNumber(_y).plus(yieldRate);
          stocks.push(stockCode);
          dateMapYieldRate.set(tradeDate, {
            stocks,
            yieldRate: v,
          });
        } else {
          dateMapYieldRate.set(tradeDate, {
            stocks: [stockCode],
            yieldRate: yieldRate,
          });
        }
      });

      const x: string[] = [],
        y: number[] = [];
      let previousYieldRate = new BigNumber(0);
      dateMapYieldRate.forEach((item, key) => {
        x.push(key);
        previousYieldRate = previousYieldRate.plus(item.yieldRate);
        y.push(previousYieldRate.toNumber());
      });

      return {
        x,
        y,
      };
    } else {
      const stockProfitList = await this.findStockProfit(query);
      if (!stockProfitList.length) {
        throw '未查询到符合条件的股票';
      }
      return stockProfitList.reduce(
        (pre, next) => {
          const yLen = pre.y.length;
          pre.x.push(next.tradeDate);

          if (yLen) {
            const lastY = pre.y[yLen - 1];
            pre.y.push(lastY + +next.profitRatio);
          } else {
            pre.y.push(+next.profitRatio);
          }

          return pre;
        },
        {
          x: [] as string[],
          y: [] as number[],
        },
      );
    }
  }
}
