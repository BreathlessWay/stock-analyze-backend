// import { relative, resolve, sep } from 'node:path';
//
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/sequelize';
// // The Sequelize class is imported from the sequelize-typescript package.
// import { Op } from 'sequelize';
// import * as ExcelJS from 'exceljs';
// import BigNumber from 'bignumber.js';
//
// import { StockProfitModel, StockPriceModel } from './analyze.model';
//
// import {
//   Analyze_Result_File_End_Name,
//   Project_Folder_Path,
//   Upload_Folder_Path,
// } from '../../constants';
//
// import type { StockQueryDto } from './analyze.dto';
//
// @Injectable()
// export class AnalyzeService {
//   constructor(
//     @InjectModel(StockProfitModel)
//     private stockProfitModel: typeof StockProfitModel,
//     @InjectModel(StockPriceModel)
//     private stockPriceModel: typeof StockPriceModel,
//   ) {}
//
//   async findStockProfit(query: StockQueryDto) {
//     const res = await this.stockProfitModel.findAll({
//       where: {
//         stockCode: {
//           [Op.in]: query.stockCode,
//         },
//         tradeDate: {
//           [Op.gte]: query.start_date,
//           [Op.lte]: query.end_date,
//         },
//       },
//       order: [['tradeDate', 'ASC']],
//     });
//     if (res && res.length) {
//       return res.map((item) => {
//         return {
//           tradeDate: item.tradeDate,
//           stockCode: item.stockCode,
//           profitRatio: item.profitRatio,
//         };
//       });
//     }
//     return [];
//   }
//
//   async findStockPrice(query: StockQueryDto) {
//     const res = await this.stockPriceModel.findAll({
//       where: {
//         stockCode: {
//           [Op.in]: query.stockCode,
//         },
//         tradeDate: {
//           [Op.gte]: query.start_date,
//           [Op.lte]: query.end_date,
//         },
//       },
//       order: [['tradeDate', 'ASC']],
//     });
//     if (res && res.length) {
//       return res.map((item) => {
//         return {
//           tradeDate: item.tradeDate,
//           stockCode: item.stockCode,
//           price: item.price,
//         };
//       });
//     }
//     return [];
//   }
//
//   async findStock(
//     query: StockQueryDto,
//     stockCountMap: Record<string, number> | null,
//   ) {
//     const [stockPriceList, stockProfitList] = await Promise.all([
//       this.findStockPrice(query),
//       this.findStockProfit(query),
//     ]);
//     if (!stockPriceList.length || !stockProfitList.length) {
//       throw '未查询到符合条件的股票';
//     }
//     return stockPriceList.map((item) => {
//       const { profitRatio } = stockProfitList.find(
//         (_) => _.stockCode === item.stockCode && _.tradeDate === item.tradeDate,
//       ) || { profitRatio: 0 };
//       return {
//         ...item,
//         profitRatio,
//         stockCount: stockCountMap?.[item.stockCode] ?? 1,
//       };
//     });
//   }
//
//   async exportAnalyzeResult(
//     query: StockQueryDto,
//     stockCountMap: Record<string, number> | null,
//     operName: string,
//   ) {
//     const exportAnalyzeFileData: Record<string, any>[] = [];
//
//     if (stockCountMap && query.stockCode.length > 1) {
//       const [stockPriceList, stockProfitList] = await Promise.all([
//         this.findStockPrice(query),
//         this.findStockProfit(query),
//       ]);
//       if (!stockPriceList.length || !stockProfitList.length) {
//         throw '未查询到符合条件的股票';
//       }
//       const marketValueMap: Record<string, BigNumber> = {};
//       const stockMarketValueList = stockPriceList.map((item) => {
//         const { tradeDate, stockCode, price } = item;
//         const marketValue = new BigNumber(
//           stockCountMap[stockCode],
//         ).multipliedBy(new BigNumber(price));
//         if (marketValueMap[tradeDate]) {
//           marketValueMap[tradeDate] =
//             marketValueMap[tradeDate].plus(marketValue);
//         } else {
//           marketValueMap[tradeDate] = marketValue;
//         }
//         const { profitRatio } = stockProfitList.find(
//           (_) => _.stockCode === stockCode && _.tradeDate === tradeDate,
//         ) || { profitRatio: 0 };
//         return {
//           tradeDate,
//           stockCode,
//           marketValue,
//           profitRatio,
//         };
//       });
//       const dateMapYieldRate = new Map<
//         string,
//         {
//           stocks: string[];
//           yieldRate: BigNumber;
//         }
//       >();
//       stockMarketValueList.forEach((item) => {
//         const { tradeDate, marketValue, profitRatio, stockCode } = item;
//         const currentDayAllMarketValue = marketValueMap[item.tradeDate];
//         const yieldRate = marketValue
//           .div(currentDayAllMarketValue)
//           .multipliedBy(new BigNumber(profitRatio));
//         if (dateMapYieldRate.has(tradeDate)) {
//           const { stocks, yieldRate: _y } = dateMapYieldRate.get(tradeDate);
//           const v = new BigNumber(_y).plus(yieldRate);
//           stocks.push(stockCode);
//           dateMapYieldRate.set(tradeDate, {
//             stocks,
//             yieldRate: v,
//           });
//         } else {
//           dateMapYieldRate.set(tradeDate, {
//             stocks: [stockCode],
//             yieldRate: yieldRate,
//           });
//         }
//       });
//
//       let previousYieldRate = new BigNumber(0);
//       dateMapYieldRate.forEach((item, key) => {
//         previousYieldRate = previousYieldRate.plus(item.yieldRate);
//         const v = previousYieldRate.toNumber();
//         const arr = {
//           tradeDate: key,
//           profitRatio: item.yieldRate.toNumber(),
//           profitRatioSum: v,
//         };
//         exportAnalyzeFileData.push(arr);
//       });
//     } else {
//       const stockProfitList = await this.findStockProfit(query);
//       if (!stockProfitList.length) {
//         throw '未查询到符合条件的股票';
//       }
//       stockProfitList.reduce(
//         (pre, next) => {
//           const arr = {
//             tradeDate: next.tradeDate,
//             profitRatio: next.profitRatio,
//             profitRatioSum: next.profitRatio,
//           };
//           const yLen = pre.y.length;
//           pre.x.push(next.tradeDate);
//
//           if (yLen) {
//             const lastY = pre.y[yLen - 1];
//             const v = lastY + +next.profitRatio;
//             arr.profitRatioSum = v;
//             pre.y.push(v);
//           } else {
//             pre.y.push(+next.profitRatio);
//           }
//           exportAnalyzeFileData.push(arr);
//           return pre;
//         },
//         {
//           x: [] as string[],
//           y: [] as number[],
//         },
//       );
//     }
//     if (exportAnalyzeFileData && exportAnalyzeFileData.length) {
//       const workbook = new ExcelJS.Workbook(); // 创建新的工作簿
//       const worksheet = workbook.addWorksheet('Sheet 1'); // 创建新的工作表
//
//       // 设置表头
//       worksheet.columns = [
//         { header: '收益日', key: 'tradeDate', width: 20 },
//         { header: '当日收益', key: 'profitRatio', width: 20 },
//         { header: '总收益', key: 'profitRatioSum', width: 20 },
//         // { header: '当日查询股票', key: 'stocks', width: 40 },
//       ];
//
//       // 添加数据
//       worksheet.addRows(exportAnalyzeFileData);
//
//       const analyzeResultFilePath = resolve(
//         Upload_Folder_Path,
//         `${operName}${Analyze_Result_File_End_Name}`,
//       );
//
//       // 写入 Excel 文件
//       await workbook.xlsx.writeFile(analyzeResultFilePath);
//
//       return relative(Project_Folder_Path, analyzeResultFilePath)
//         .split(sep)
//         .join('/');
//     } else {
//       throw '分析结果已失效，请重新查询！';
//     }
//   }
// }
