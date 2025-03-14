import { parentPort, workerData } from 'worker_threads';

import BigNumber from 'bignumber.js';

const handle = ({
  stockPriceList,
  stockCountMap,
  stockProfitMap,
}: {
  stockPriceList: {
    tradeDate: string;
    stockCode: string;
    price: number;
  }[];
  stockProfitMap: Map<
    string,
    Map<
      string,
      {
        profitRatio: number;
        originalProfitRatio: number;
        changeRate: number;
      }
    >
  >;
  stockCountMap: Record<string, number> | null;
}) => {
  const marketValueMap: Record<string, BigNumber> = {};
  const firstDayPriceMap = new Map<string, BigNumber>();

  const stockMarketValueList = stockPriceList.map((item) => {
    const { tradeDate, stockCode, price } = item;
    const stockCount = stockCountMap?.[stockCode] || 1;
    // 单股当天市值
    const marketValue = new BigNumber(stockCount).multipliedBy(price);

    // 多股当天总市值
    if (marketValueMap[tradeDate]) {
      marketValueMap[tradeDate] = marketValueMap[tradeDate].plus(marketValue);
    } else {
      marketValueMap[tradeDate] = marketValue;
    }

    // 获取利润信息
    let profitInfo: {
      profitRatio: number;
      changeRate: number;
      originalProfitRatio?: number;
    };
    if (stockProfitMap.has(stockCode)) {
      profitInfo = stockProfitMap.get(stockCode).get(tradeDate) || {
        profitRatio: 0,
        originalProfitRatio: 0,
        changeRate: 0,
      };
    } else {
      profitInfo = { profitRatio: 0, originalProfitRatio: 0, changeRate: 0 };
    }

    // 获取第一天价格
    let firstDayPrice: BigNumber;
    if (!firstDayPriceMap.has(stockCode)) {
      firstDayPrice = new BigNumber(price);
      firstDayPriceMap.set(stockCode, firstDayPrice);
    } else {
      firstDayPrice = firstDayPriceMap.get(stockCode);
    }

    // 当天价格相对第一天的价格的收益率，即 股票收益率
    const baseProfitRatio = new BigNumber(price).div(firstDayPrice).minus(1);

    return {
      tradeDate,
      marketValue,
      profitRatio: profitInfo.profitRatio,
      changeRate: profitInfo.changeRate,
      baseProfitRatio,
    };
  });

  const dayMapYieldRate = new Map<
    string,
    {
      yieldRateProfitRatioSum: BigNumber;
      yieldRateBaseProfitRatioSum: BigNumber;
      yieldRateChangeRateSum: BigNumber;
    }
  >();

  stockMarketValueList.forEach((item) => {
    const { tradeDate, marketValue, profitRatio, baseProfitRatio, changeRate } =
      item;
    const currentDayAllMarketValue = marketValueMap[tradeDate];
    const yieldRate = marketValue.div(currentDayAllMarketValue); // 该股当天的权重，即市值占比
    const yieldRateProfitRatio = yieldRate.multipliedBy(
      new BigNumber(profitRatio),
    ); // 当天收益率 * 权重，即增强收益率
    const yieldRateBaseProfitRatio = yieldRate.multipliedBy(baseProfitRatio); // 当天股票收益率 * 权重
    const yieldRateChangeRate = yieldRate.multipliedBy(changeRate); // 当天股票换手率 * 权重

    if (dayMapYieldRate.has(tradeDate)) {
      const {
        yieldRateProfitRatioSum,
        yieldRateBaseProfitRatioSum,
        yieldRateChangeRateSum,
      } = dayMapYieldRate.get(tradeDate);
      dayMapYieldRate.set(tradeDate, {
        yieldRateProfitRatioSum:
          yieldRateProfitRatioSum.plus(yieldRateProfitRatio),
        yieldRateBaseProfitRatioSum: yieldRateBaseProfitRatioSum.plus(
          yieldRateBaseProfitRatio,
        ),
        yieldRateChangeRateSum:
          yieldRateChangeRateSum.plus(yieldRateChangeRate),
      });
    } else {
      dayMapYieldRate.set(tradeDate, {
        yieldRateProfitRatioSum: yieldRateProfitRatio,
        yieldRateBaseProfitRatioSum: yieldRateBaseProfitRatio,
        yieldRateChangeRateSum: yieldRateChangeRate,
      });
    }
  });

  const exportAnalyzeFileData: Record<string, any>[] = [];
  const tradeDateList: string[] = [], // 交易日
    profitRatioSumList: number[] = [], // 增强收益率
    baseProfitRatioSumList: number[] = [], // 股票收益率
    finalProfitRatioSumList: number[] = [], // 最终收益率
    changeRateSumList: number[] = []; // 换手率
  let previousYieldRateProfitRatio = new BigNumber(0), // 前一天增强收益率
    firstDayProfitRatio: BigNumber; // 第一天增强收益率

  dayMapYieldRate.forEach((item, key) => {
    tradeDateList.push(key);
    const {
      yieldRateProfitRatioSum,
      yieldRateBaseProfitRatioSum,
      yieldRateChangeRateSum,
    } = item;

    previousYieldRateProfitRatio = previousYieldRateProfitRatio.plus(
      yieldRateProfitRatioSum,
    );
    if (firstDayProfitRatio === undefined) {
      firstDayProfitRatio = yieldRateProfitRatioSum;
    }

    const profitRatioSum = previousYieldRateProfitRatio
        .minus(firstDayProfitRatio)
        .toNumber(),
      baseProfitRatioSum = yieldRateBaseProfitRatioSum.toNumber(),
      finalProfitRatioSum = previousYieldRateProfitRatio
        .minus(firstDayProfitRatio)
        .plus(yieldRateBaseProfitRatioSum)
        .toNumber();
    const changeRateSum = yieldRateChangeRateSum.toNumber();

    exportAnalyzeFileData.push({
      tradeDate: key,
      profitRatio: yieldRateProfitRatioSum.toNumber(),
      baseProfitRatio: yieldRateBaseProfitRatioSum.toNumber(),
      profitRatioSum,
      finalProfitRatioSum,
      changeRateSum,
    });

    profitRatioSumList.push(profitRatioSum);
    baseProfitRatioSumList.push(baseProfitRatioSum);
    finalProfitRatioSumList.push(finalProfitRatioSum);
    changeRateSumList.push(changeRateSum);
  });

  return {
    exportAnalyzeFileData: exportAnalyzeFileData.slice(1),
    tradeDateList: tradeDateList.slice(1),
    profitRatioSumList: profitRatioSumList.slice(1),
    baseProfitRatioSumList: baseProfitRatioSumList.slice(1),
    finalProfitRatioSumList: finalProfitRatioSumList.slice(1),
    changeRateSumList: changeRateSumList.slice(1),
  };
};

parentPort.postMessage(handle(workerData));
