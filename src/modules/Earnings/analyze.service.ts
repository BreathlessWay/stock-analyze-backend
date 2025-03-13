import { relative, resolve, sep } from 'node:path';
import { Worker } from 'worker_threads';
// import * as os from 'os';

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// The Sequelize class is imported from the sequelize-typescript package.
import { Op } from 'sequelize';
// import BigNumber from 'bignumber.js';
import { Cache } from 'cache-manager';
import * as ExcelJS from 'exceljs';

import { StockProfitModel, StockPriceModel } from './analyze.model';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Analyze_Result_File_End_Name,
  DefaultServiceCharge,
  Project_Folder_Path,
  Upload_Folder_Path,
} from '../../constants';

// import { stockPriceListMock, stockProfitListMock } from './mocks';

import type { StockQueryDto } from './analyze.dto';

// const workerCount = os.cpus().length;
// const workers = [];
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
          originalProfitRatio: item.profitRatio,
          profitRatio:
            Number(item.profitRatio || 0) +
            2 *
              (item.changeRate || 0) *
              ((DefaultServiceCharge - Number(query.service_charge)) / 1e4),
          changeRate: item.changeRate,
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
    // const stockPriceList = stockPriceListMock,
    //   stockProfitList = stockProfitListMock;
    // if (stockCountMap && query.stockCode.length > 1) {
    if (!stockPriceList.length || !stockProfitList.length) {
      throw '未查询到符合条件的股票';
    }

    const result = await new Promise<any>((resolve) => {
      const worker = new Worker('./src/modules/Earnings/worker.js', {
        workerData: {
          stockPriceList,
          stockProfitList,
          stockCountMap,
        },
      });
      worker.on('message', resolve);
    });

    await this.cacheManager.set(
      token,
      JSON.stringify(result?.exportAnalyzeFileData),
    );
    return {
      tradeDateList: result?.tradeDateList, // 交易日
      profitRatioSumList: result?.profitRatioSumList, // 增强收益率
      baseProfitRatioSumList: result?.baseProfitRatioSumList, // 股票收益率
      finalProfitRatioSumList: result?.finalProfitRatioSumList, // 最终收益率
      changeRateSumList: result?.changeRateSumList, // 换手率
      originalList: result?.stockYieldRateList,
    };
  }

  async exportAnalyzeResult(token: string, operName: string) {
    const result = await this.cacheManager.get<string>(token);
    if (result) {
      await this.cacheManager.del(token);
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
        { header: '换手率', key: 'changeRateSum', width: 20 },
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
