import { relative, resolve, sep } from 'node:path';

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// The Sequelize class is imported from the sequelize-typescript package.
import { Op } from 'sequelize';
import BigNumber from 'bignumber.js';
import { Cache } from 'cache-manager';
import * as ExcelJS from 'exceljs';

import { StockProfitModel, StockPriceModel } from './analyze.model';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Analyze_Result_File_End_Name,
  Project_Folder_Path,
  Upload_Folder_Path,
} from '../../constants';

import type { StockQueryDto } from './analyze.dto';

@Injectable()
export class AnalyzeService {
  constructor(
    @InjectModel(StockProfitModel)
    private stockProfitModel: typeof StockProfitModel,
    @InjectModel(StockPriceModel)
    private stockPriceModel: typeof StockPriceModel,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    stockCountMap: Record<string, number> | null,
    token: string,
  ) {
    const [stockPriceList, stockProfitList] = await Promise.all([
      this.findStockPrice(query),
      this.findStockProfit(query),
    ]);
    // if (stockCountMap && query.stockCode.length > 1) {
    if (!stockPriceList.length || !stockProfitList.length) {
      throw '未查询到符合条件的股票';
    }
    const marketValueMap: Record<string, BigNumber> = {},
      firstDayPriceMap = new Map<string, BigNumber>();

    const stockMarketValueList = stockPriceList.map((item) => {
      const { tradeDate, stockCode, price } = item,
        stockCount = stockCountMap?.[stockCode] || 1,
        marketValue = new BigNumber(stockCount).multipliedBy(
          new BigNumber(price),
        );
      if (marketValueMap[tradeDate]) {
        marketValueMap[tradeDate] = marketValueMap[tradeDate].plus(marketValue);
      } else {
        marketValueMap[tradeDate] = marketValue;
      }
      const { profitRatio } = stockProfitList.find(
        (_) => _.stockCode === stockCode && _.tradeDate === tradeDate,
      ) || { profitRatio: 0 };

      let firstDayPrice: BigNumber;
      if (!firstDayPriceMap.has(stockCode)) {
        firstDayPrice = new BigNumber(price);
        firstDayPriceMap.set(stockCode, firstDayPrice);
      } else {
        firstDayPrice = firstDayPriceMap.get(stockCode);
      }

      const baseProfitRatio = new BigNumber(price).div(firstDayPrice).minus(1);

      return {
        stockCount,
        price,
        tradeDate,
        stockCode,
        marketValue,
        profitRatio,
        baseProfitRatio,
      };
    });

    const dayMapYieldRate = new Map<
      string,
      {
        yieldRateProfitRatioSum: BigNumber;
        yieldRateBaseProfitRatioSum: BigNumber;
      }
    >();
    const stockYieldRateList = stockMarketValueList.map((item) => {
      const { tradeDate, marketValue, profitRatio, baseProfitRatio } = item;
      const currentDayAllMarketValue = marketValueMap[tradeDate];
      const yieldRate = marketValue.div(currentDayAllMarketValue),
        yieldRateProfitRatio = yieldRate.multipliedBy(
          new BigNumber(profitRatio),
        ),
        yieldRateBaseProfitRatio = yieldRate.multipliedBy(baseProfitRatio);

      if (dayMapYieldRate.has(tradeDate)) {
        const { yieldRateProfitRatioSum, yieldRateBaseProfitRatioSum } =
          dayMapYieldRate.get(tradeDate);
        dayMapYieldRate.set(tradeDate, {
          yieldRateProfitRatioSum:
            yieldRateProfitRatioSum.plus(yieldRateProfitRatio),
          yieldRateBaseProfitRatioSum: yieldRateBaseProfitRatioSum.plus(
            yieldRateBaseProfitRatio,
          ),
        });
      } else {
        dayMapYieldRate.set(tradeDate, {
          yieldRateProfitRatioSum: yieldRateProfitRatio,
          yieldRateBaseProfitRatioSum: yieldRateBaseProfitRatio,
        });
      }
      return {
        ...item,
        yieldRate,
        yieldRateProfitRatio,
        yieldRateBaseProfitRatio,
      };
    });

    const exportAnalyzeFileData: Record<string, any>[] = [];
    const tradeDateList: string[] = [],
      profitRatioSumList: number[] = [],
      baseProfitRatioSumList: number[] = [],
      finalProfitRatioSumList: number[] = [];
    let previousYieldRateProfitRatio = new BigNumber(0),
      firstDayProfitRatio: any;
    dayMapYieldRate.forEach((item, key) => {
      tradeDateList.push(key);
      const { yieldRateProfitRatioSum, yieldRateBaseProfitRatioSum } = item;
      previousYieldRateProfitRatio = previousYieldRateProfitRatio.plus(
        yieldRateProfitRatioSum,
      );
      if (typeof firstDayProfitRatio === 'undefined') {
        firstDayProfitRatio = yieldRateProfitRatioSum;
      }

      const profitRatioSum = previousYieldRateProfitRatio.toNumber(),
        baseProfitRatioSum = yieldRateBaseProfitRatioSum.toNumber(),
        finalProfitRatioSum = previousYieldRateProfitRatio
          .minus(firstDayProfitRatio)
          .plus(yieldRateBaseProfitRatioSum)
          .toNumber();

      const dayProfitRatioJson = {
        tradeDate: key,
        profitRatio: yieldRateProfitRatioSum.toNumber(),
        baseProfitRatio: yieldRateBaseProfitRatioSum.toNumber(),
        profitRatioSum,
        finalProfitRatioSum,
      };
      exportAnalyzeFileData.push(dayProfitRatioJson);
      profitRatioSumList.push(profitRatioSum);
      baseProfitRatioSumList.push(baseProfitRatioSum);
      finalProfitRatioSumList.push(finalProfitRatioSum);
    });
    await this.cacheManager.set(
      token,
      JSON.stringify(exportAnalyzeFileData.slice(1)),
    );
    return {
      tradeDateList: tradeDateList.slice(1),
      profitRatioSumList: profitRatioSumList.slice(1),
      baseProfitRatioSumList: baseProfitRatioSumList.slice(1),
      finalProfitRatioSumList: finalProfitRatioSumList.slice(1),
      originalList: stockYieldRateList.slice(1),
    };
    // } else {
    //   if (!stockProfitList.length) {
    //     throw '未查询到符合条件的股票';
    //   }
    //   const exportAnalyzeFileData: Record<string, any>[] = [];
    //   const result = stockProfitList.reduce(
    //     (pre, next) => {
    //       const { price } = stockPriceList.find(
    //         (_) =>
    //           _.tradeDate === next.tradeDate && _.stockCode === next.stockCode,
    //       ) || { price: 0 };
    //       const arr = {
    //         tradeDate: next.tradeDate,
    //         profitRatio: next.profitRatio,
    //         profitRatioSum: next.profitRatio,
    //       };
    //       pre.originalList.push({
    //         ...next,
    //         price,
    //         stockCount: 1,
    //       });
    //       const yLen = pre.y.length;
    //       pre.x.push(next.tradeDate);
    //
    //       if (yLen) {
    //         const lastY = pre.y[yLen - 1];
    //         const v = lastY + +next.profitRatio;
    //         arr.profitRatioSum = v;
    //         pre.y.push(v);
    //       } else {
    //         pre.y.push(+next.profitRatio);
    //       }
    //       exportAnalyzeFileData.push(arr);
    //       return pre;
    //     },
    //     {
    //       x: [] as string[],
    //       y: [] as number[],
    //       originalList: [] as {
    //         stockCode: string;
    //         tradeDate: string;
    //         profitRatio: number;
    //         price: number;
    //         stockCount: number;
    //       }[],
    //     },
    //   );
    //   await this.cacheManager.set(token, JSON.stringify(exportAnalyzeFileData));
    //   return result;
    // }
  }

  async exportAnalyzeResult(token: string, operName: string) {
    const result = await this.cacheManager.get<string>(token);
    if (result) {
      const parseResult = JSON.parse(result);
      const workbook = new ExcelJS.Workbook(); // 创建新的工作簿
      const worksheet = workbook.addWorksheet('Sheet 1'); // 创建新的工作表

      // 设置表头
      worksheet.columns = [
        { header: '收益日', key: 'tradeDate', width: 20 },
        { header: '收益率', key: 'profitRatio', width: 20 },
        { header: '增强收益率', key: 'profitRatioSum', width: 20 },
        { header: '股票收益率', key: 'baseProfitRatio', width: 20 },
        { header: '最终收益率', key: 'finalProfitRatioSum', width: 20 },
        // { header: '股票收益率', key: 'baseProfitRatioSum', width: 20 },
        // { header: '当日查询股票', key: 'stocks', width: 40 },
      ];

      // 添加数据
      worksheet.addRows(parseResult);

      const analyzeResultFilePath = resolve(
        Upload_Folder_Path,
        `${operName}${Analyze_Result_File_End_Name}`,
      );

      // 写入 Excel 文件
      await workbook.xlsx.writeFile(analyzeResultFilePath);

      return relative(Project_Folder_Path, analyzeResultFilePath)
        .split(sep)
        .join('/');
    } else {
      throw '分析结果已失效，请重新查询！';
    }
  }
}
