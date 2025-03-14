import { parentPort, workerData } from 'worker_threads';

import BigNumber from 'bignumber.js';

const handle = ({
  stockPriceList,
  stockCountMap,
  stockProfitList,
}: {
  stockPriceList: {
    tradeDate: string;
    stockCode: string;
    price: number;
  }[];
  stockProfitList: {
    tradeDate: string;
    stockCode: string;
    originalProfitRatio: number;
    profitRatio: number;
    changeRate: number;
  }[];
  stockCountMap: Record<string, number> | null;
}) => {
  // 将stockProfitList转换为Map，以便快速查找
  const stockProfitMap = new Map<
    string,
    Map<
      string,
      {
        profitRatio: number;
        originalProfitRatio: number;
        changeRate: number;
      }
    >
  >();
  stockProfitList.forEach((item) => {
    if (!stockProfitMap.has(item.stockCode)) {
      stockProfitMap.set(item.stockCode, new Map());
    }
    stockProfitMap.get(item.stockCode).set(item.tradeDate, {
      profitRatio: item.profitRatio,
      originalProfitRatio: item.originalProfitRatio,
      changeRate: item.changeRate,
    });
  });

  const marketValueMap: Record<string, BigNumber> = {};
  const firstDayPriceMap = new Map<string, BigNumber>();

  const stockMarketValueList = stockPriceList.map((item) => {
    const { tradeDate, stockCode, price } = item;
    const stockCount = stockCountMap?.[stockCode] || 1;
    const marketValue = new BigNumber(stockCount).multipliedBy(price);

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
    const yieldRate = marketValue.div(currentDayAllMarketValue);
    const yieldRateProfitRatio = yieldRate.multipliedBy(
      new BigNumber(profitRatio),
    );
    const yieldRateBaseProfitRatio = yieldRate.multipliedBy(baseProfitRatio);
    const yieldRateChangeRate = yieldRate.multipliedBy(changeRate);

    if (dayMapYieldRate.has(tradeDate)) {
      const existing = dayMapYieldRate.get(tradeDate);
      dayMapYieldRate.set(tradeDate, {
        yieldRateProfitRatioSum:
          existing.yieldRateProfitRatioSum.plus(yieldRateProfitRatio),
        yieldRateBaseProfitRatioSum: existing.yieldRateBaseProfitRatioSum.plus(
          yieldRateBaseProfitRatio,
        ),
        yieldRateChangeRateSum:
          existing.yieldRateChangeRateSum.plus(yieldRateChangeRate),
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
  const tradeDateList: string[] = [];
  const profitRatioSumList: number[] = [];
  const baseProfitRatioSumList: number[] = [];
  const finalProfitRatioSumList: number[] = [];
  const changeRateSumList: number[] = [];

  let previousYieldRateProfitRatio = new BigNumber(0);
  let firstDayProfitRatio: BigNumber;

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
      .toNumber();
    const baseProfitRatioSum = yieldRateBaseProfitRatioSum.toNumber();
    const finalProfitRatioSum = previousYieldRateProfitRatio
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
