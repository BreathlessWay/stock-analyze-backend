const { parentPort, workerData } = require('worker_threads');
const BigNumber = require('bignumber.js');

const handle = ({ stockPriceList, stockCountMap, stockProfitList }) => {
  const marketValueMap = {},
    firstDayPriceMap = new Map();
  const stockMarketValueList = stockPriceList.map((item) => {
    const { tradeDate, stockCode, price } = item,
      stockCount = stockCountMap?.[stockCode] || 1,
      // 单股当天市值
      marketValue = new BigNumber(stockCount).multipliedBy(
        new BigNumber(price),
      );
    // 多股当天总市值
    if (marketValueMap[tradeDate]) {
      marketValueMap[tradeDate] = marketValueMap[tradeDate].plus(marketValue);
    } else {
      marketValueMap[tradeDate] = marketValue;
    }
    // 单股当天收益率
    const { profitRatio, originalProfitRatio, changeRate } =
      stockProfitList.find(
        (_) => _.stockCode === stockCode && _.tradeDate === tradeDate,
      ) || { profitRatio: 0, originalProfitRatio: 0, changeRate: 0 };

    // 查询时间段内，第一天的股票价格
    let firstDayPrice;
    if (!firstDayPriceMap.has(stockCode)) {
      firstDayPrice = new BigNumber(price);
      firstDayPriceMap.set(stockCode, firstDayPrice);
    } else {
      firstDayPrice = firstDayPriceMap.get(stockCode);
    }

    // 当天价格相对第一天的价格的收益率，即 股票收益率
    const baseProfitRatio = new BigNumber(price).div(firstDayPrice).minus(1);

    return {
      stockCount,
      price,
      tradeDate,
      stockCode,
      marketValue,
      profitRatio,
      originalProfitRatio,
      changeRate,
      baseProfitRatio,
    };
  });

  const dayMapYieldRate = new Map();
  const stockYieldRateList = stockMarketValueList.map((item) => {
    const { tradeDate, marketValue, profitRatio, baseProfitRatio } = item;
    const currentDayAllMarketValue = marketValueMap[tradeDate];
    const yieldRate = marketValue.div(currentDayAllMarketValue), // 该股当天的权重，即市值占比
      yieldRateProfitRatio = yieldRate.multipliedBy(new BigNumber(profitRatio)), // 当天收益率 * 权重，即增强收益率
      yieldRateBaseProfitRatio = yieldRate.multipliedBy(baseProfitRatio); // 当天股票收益率 * 权重

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

  const exportAnalyzeFileData = [];
  const tradeDateList = [], // 交易日
    profitRatioSumList = [], // 增强收益率
    baseProfitRatioSumList = [], // 股票收益率
    finalProfitRatioSumList = []; // 最终收益率
  let previousYieldRateProfitRatio = new BigNumber(0), // 前一天增强收益率
    firstDayProfitRatio; // 第一天增强收益率
  dayMapYieldRate.forEach((item, key) => {
    tradeDateList.push(key);
    const { yieldRateProfitRatioSum, yieldRateBaseProfitRatioSum } = item;
    previousYieldRateProfitRatio = previousYieldRateProfitRatio.plus(
      yieldRateProfitRatioSum,
    );
    if (typeof firstDayProfitRatio === 'undefined') {
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

  return {
    exportAnalyzeFileData: exportAnalyzeFileData.slice(1),
    tradeDateList: tradeDateList.slice(1), // 交易日
    profitRatioSumList: profitRatioSumList.slice(1), // 增强收益率
    baseProfitRatioSumList: baseProfitRatioSumList.slice(1), // 股票收益率
    finalProfitRatioSumList: finalProfitRatioSumList.slice(1), // 最终收益率
    originalList: stockYieldRateList.slice(1),
  };
};

parentPort.postMessage(handle(workerData));
