import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import * as math from 'mathjs';
import { TokenMetadata } from '../services/ft-contract';
import { isStablePool } from '../services/near';
import { Pool, getStablePoolInfoKey } from '../services/pool';
import { getSwappedAmount, estimateSwap } from '../services/stable-swap';
import { EstimateSwapView } from '../services/swap';
import Big from 'big.js';
import _, { sortBy } from 'lodash';
import { getStablePoolDecimal } from '../pages/stable/StableSwapEntry';
import { WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
import { IServerRoute } from '~src/services/smartRouterFromServer';

const BPS_CONVERSION = 10000;

const ROUNDING_OFFSETS: BN[] = [];
const BN10 = new BN(10);
for (let i = 0, offset = new BN(5); i < 24; i++, offset = offset.mul(BN10)) {
  ROUNDING_OFFSETS[i] = offset;
}

export const ONLY_ZEROS = /^0*\.?0*$/;

export const sumBN = (...args: string[]): string => {
  return args
    .reduce((acc, n) => {
      return acc.add(new BN(n));
    }, new BN(0))
    .toString();
};
export const toReadableNumber = (
  decimals: number,
  number: string = '0'
): string => {
  if (!decimals) return number;

  const wholeStr = number.substring(0, number.length - decimals) || '0';
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, '0')
    .substring(0, decimals);

  return `${wholeStr}.${fractionStr}`.replace(/\.?0+$/, '');
};

export const toNonDivisibleNumber = (
  decimals: number,
  number: string
): string => {
  if (decimals === null || decimals === undefined) return number;
  const [wholePart, fracPart = ''] = number.split('.');

  return `${wholePart}${fracPart.padEnd(decimals, '0').slice(0, decimals)}`
    .replace(/^0+/, '')
    .padStart(1, '0');
};

export const toPrecision = (
  number: string,
  precision: number,
  withCommas: boolean = false,
  atLeastOne: boolean = true
): string => {
  if (typeof number === 'undefined') return '0';

  const [whole, decimal = ''] = number.split('.');

  let str = `${withCommas ? formatWithCommas(whole) : whole}.${decimal.slice(
    0,
    precision
  )}`.replace(/\.$/, '');
  if (atLeastOne && Number(str) === 0 && str.length > 1) {
    var n = str.lastIndexOf('0');
    str = str.slice(0, n) + str.slice(n).replace('0', '1');
  }

  return str;
};

export const toRoundedReadableNumber = ({
  decimals,
  number,
  precision = 6,
  withCommas = true,
}: {
  decimals: number;
  number?: string;
  precision?: number;
  withCommas?: boolean;
}): string => {
  return toPrecision(toReadableNumber(decimals, number), precision, withCommas);
};

export const convertToPercentDecimal = (percent: number) => {
  return math.divide(percent, 100);
};

export const calculateFeePercent = (fee: number) => {
  return math.divide(fee, 100);
};

export const calculateFeeCharge = (fee: number, total: string) => {
  return math.floor(
    math.evaluate(`(${fee} / ${BPS_CONVERSION}) * ${total}`),
    3
  );
};

export const calculateAmountReceived = (
  pool: Pool,
  amountIn: string,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata
) => {
  const partialAmountIn = toReadableNumber(tokenIn.decimals, amountIn);

  const in_balance = toReadableNumber(
    tokenIn.decimals,
    pool.supplies[tokenIn.id]
  );
  const out_balance = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );

  const big_in_balance = math.bignumber(in_balance);
  const big_out_balance = math.bignumber(out_balance);

  const constant_product = big_in_balance.mul(big_out_balance);

  const new_in_balance = big_in_balance.plus(math.bignumber(partialAmountIn));

  const new_out_balance = constant_product.div(new_in_balance);

  const tokenOutReceived = big_out_balance.minus(new_out_balance);

  return tokenOutReceived;
};

export const calculateMarketPrice = (
  pool: Pool,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata
) => {
  const cur_in_balance = toReadableNumber(
    tokenIn.decimals,
    pool.supplies[tokenIn.id]
  );

  const cur_out_balance = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );

  return math.evaluate(`(${cur_in_balance} / ${cur_out_balance})`);
};

export const calculateSmartRoutingPriceImpact = (
  tokenInAmount: string,
  swapTodos: EstimateSwapView[],
  tokenIn: TokenMetadata,
  tokenMid: TokenMetadata,
  tokenOut: TokenMetadata
) => {
  const isPool1StablePool = isStablePool(swapTodos[0].pool.id);
  const isPool2StablePool = isStablePool(swapTodos[1].pool.id);

  const marketPrice1 = isPool1StablePool
    ? (
        Number(swapTodos[0].pool.rates[tokenMid.id]) /
        Number(swapTodos[0].pool.rates[tokenIn.id])
      ).toString()
    : calculateMarketPrice(swapTodos[0].pool, tokenIn, tokenMid);

  const marketPrice2 = isPool2StablePool
    ? (
        Number(swapTodos[1].pool.rates[tokenOut.id]) /
        Number(swapTodos[1].pool.rates[tokenMid.id])
      ).toString()
    : calculateMarketPrice(swapTodos[1].pool, tokenMid, tokenOut);

  const generalMarketPrice = math.evaluate(`${marketPrice1} * ${marketPrice2}`);

  const tokenMidReceived = isPool1StablePool
    ? swapTodos[0].noFeeAmountOut
    : calculateAmountReceived(
        swapTodos[0].pool,
        toNonDivisibleNumber(tokenIn.decimals, tokenInAmount),
        tokenIn,
        tokenMid
      );

  const formattedTokenMidReceived = scientificNotationToString(
    tokenMidReceived.toString()
  );

  let stableOutPool2;
  if (isPool2StablePool) {
    const stableOut = getSwappedAmount(
      tokenMid.id,
      tokenOut.id,
      formattedTokenMidReceived,
      JSON.parse(
        localStorage.getItem(
          getStablePoolInfoKey(swapTodos[1].pool.id.toString())
        )
      )
    );
    stableOutPool2 =
      stableOut[0] < 0
        ? '0'
        : toPrecision(scientificNotationToString(stableOut[2].toString()), 0);
    stableOutPool2 = toReadableNumber(
      getStablePoolDecimal(swapTodos[1].pool.id),
      stableOutPool2
    );
  }

  const tokenOutReceived = isPool2StablePool
    ? stableOutPool2
    : calculateAmountReceived(
        swapTodos[1].pool,
        toNonDivisibleNumber(tokenMid.decimals, formattedTokenMidReceived),
        tokenMid,
        tokenOut
      );

  const newMarketPrice = math.evaluate(
    `${tokenInAmount} / ${tokenOutReceived}`
  );

  const priceImpact = percent(
    subtraction(newMarketPrice, generalMarketPrice),
    newMarketPrice
  ).toString();

  return scientificNotationToString(priceImpact);
};

export const calculatePriceImpact = (
  pools: Pool[],
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  tokenInAmount: string
) => {
  let in_balance: string = '0',
    out_balance: string = '0';

  pools.forEach((pool, i) => {
    const cur_in_balance = toReadableNumber(
      tokenIn.decimals,
      pool.supplies[tokenIn.id]
    );

    const cur_out_balance = toReadableNumber(
      tokenOut.decimals,
      pool.supplies[tokenOut.id]
    );

    in_balance = BigNumber.sum(in_balance, cur_in_balance).toString();
    out_balance = BigNumber.sum(out_balance, cur_out_balance).toString();
  });

  const finalMarketPrice = math.evaluate(`(${in_balance} / ${out_balance})`);

  const separatedReceivedAmount = pools.map((pool) => {
    return calculateAmountReceived(
      pool,
      pool.partialAmountIn,
      tokenIn,
      tokenOut
    );
  });

  const finalTokenOutReceived = math.sum(...separatedReceivedAmount);

  const newMarketPrice = math.evaluate(
    `${tokenInAmount} / ${finalTokenOutReceived}`
  );

  const PriceImpact = percent(
    subtraction(newMarketPrice, finalMarketPrice),
    newMarketPrice
  ).toString();

  return scientificNotationToString(PriceImpact);
};
export const calculateExchangeRate = (
  fee: number,
  from: string,
  to: string,
  precision?: number
) => {
  try {
    return math.floor(math.evaluate(`${to} / ${from}`), precision || 4);
  } catch (error) {}
};

export const subtraction = (initialValue: string, toBeSubtract: string) => {
  return math.format(math.evaluate(`${initialValue} - ${toBeSubtract}`), {
    notation: 'fixed',
  });
};

export const percentOf = (percent: number, num: number | string) => {
  return math.evaluate(`${convertToPercentDecimal(percent)} * ${num}`);
};

export const percentOfBigNumber = (
  percent: number,
  num: number | string,
  precision: number
) => {
  const valueBig = math.bignumber(num);
  const percentBig = math.bignumber(percent).div(100);

  return toPrecision(
    scientificNotationToString(valueBig.mul(percentBig).toString()),
    precision
  );
};

export const percentLess = (percent: number, num: number | string) => {
  return math.format(math.evaluate(`${num} - ${percentOf(percent, num)}`), {
    notation: 'fixed',
  });
};

export const percentIncrese = (percent: number, num: number | string) => {
  return math.format(math.evaluate(`${num} + ${percentOf(percent, num)}`), {
    notation: 'fixed',
  });
};

export function formatWithCommas(value: string): string {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.replace(pattern, '$1,$2');
  }
  return value;
}

export function divide(numerator: string, denominator: string) {
  return math.format(math.evaluate(`${numerator} / ${denominator}`), {
    notation: 'fixed',
  });
}

export function multiply(factor1: string, factor2: string) {
  return math.format(math.evaluate(`${factor1} * ${factor2}`), {
    notation: 'fixed',
  });
}

export const percent = (numerator: string, denominator: string) => {
  if (new Big(denominator || '0').eq(0)) {
    return 0;
  }
  return math.evaluate(`(${numerator} / ${denominator}) * 100`);
};

export const calculateFairShare = ({
  shareOf,
  contribution,
  totalContribution,
}: {
  shareOf: string;
  contribution: string;
  totalContribution: string;
}) => {
  return math.format(
    math.evaluate(`(${shareOf} * ${contribution}) / ${totalContribution}`),
    {
      notation: 'fixed',
      precision: 0,
    }
  );
};

export const toInternationalCurrencySystem = (
  labelValue: string,
  percent?: number
) => {
  const hasPercent = !(percent == undefined || percent == null);
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(percent || 2) + 'B'
    : Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(percent || 2) + 'M'
    : Math.abs(Number(labelValue)) >= 1.0e3
    ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(percent || 2) + 'K'
    : Math.abs(Number(labelValue)).toFixed(hasPercent ? percent : 2);
};

export const toInternationalCurrencySystemLongString = (
  labelValue: string,
  percent?: number
) => {
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(percent || 2) + 'B'
    : Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(percent || 2) + 'M'
    : Math.abs(Number(labelValue)).toFixed(percent || 2);
};

export const toInternationalCurrencySystemNature = (
  labelValue: string,
  percent?: number
) => {
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? new BigNumber(Math.abs(Number(labelValue)) / 1.0e9).toFixed(
        percent || 2,
        1
      ) + 'B'
    : Math.abs(Number(labelValue)) >= 1.0e6
    ? new BigNumber(Math.abs(Number(labelValue)) / 1.0e6).toFixed(
        percent || 2,
        1
      ) + 'M'
    : Math.abs(Number(labelValue)) >= 1.0e3
    ? new BigNumber(Math.abs(Number(labelValue)) / 1.0e3).toFixed(
        percent || 2,
        1
      ) + 'K'
    : niceDecimals(labelValue);
};

export function scientificNotationToString(strParam: string) {
  let flag = /e/.test(strParam);
  if (!flag) return strParam;

  let sysbol = true;
  if (/e-/.test(strParam)) {
    sysbol = false;
  }

  const negative = Number(strParam) < 0 ? '-' : '';

  let index = Number(strParam.match(/\d+$/)[0]);

  let basis = strParam.match(/[\d\.]+/)[0];

  const ifFraction = basis.includes('.');

  let wholeStr;
  let fractionStr;

  if (ifFraction) {
    wholeStr = basis.split('.')[0];
    fractionStr = basis.split('.')[1];
  } else {
    wholeStr = basis;
    fractionStr = '';
  }

  if (sysbol) {
    if (!ifFraction) {
      return negative + wholeStr.padEnd(index + wholeStr.length, '0');
    } else {
      if (fractionStr.length <= index) {
        return negative + wholeStr + fractionStr.padEnd(index, '0');
      } else {
        return (
          negative +
          wholeStr +
          fractionStr.substring(0, index) +
          '.' +
          fractionStr.substring(index)
        );
      }
    }
  } else {
    if (!ifFraction)
      return (
        negative +
        wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.')
      );
    else {
      return (
        negative +
        wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.') +
        fractionStr
      );
    }
  }
}

export const calcStableSwapPriceImpact = (
  from: string,
  to: string,
  marketPrice: string = '1'
) => {
  const newMarketPrice = math.evaluate(`${from} / ${to}`);

  return math.format(
    percent(
      math.evaluate(`${newMarketPrice} - ${marketPrice}`),
      newMarketPrice
    ),
    {
      notation: 'fixed',
    }
  );
};

export const niceDecimals = (number: string | number, precision = 2) => {
  const str = number.toString();
  const [whole, decimals] = str.split('.');
  if (!decimals || Number(decimals) == 0) {
    return whole;
  } else {
    return new BigNumber(number).toFixed(precision, 1);
  }
};
export const niceDecimalsExtreme = (number: string | number, precision = 2) => {
  const str = number.toString();
  const [whole, decimals] = str.split('.');
  if (!decimals || Number(decimals) == 0) {
    return whole;
  } else if (decimals.length > precision) {
    const temp = new BigNumber(number).toFixed(precision, 1);
    const [tempWhole, tempDecimals] = temp.split('.');
    if (!tempDecimals || Number(tempDecimals) == 0) {
      return tempWhole;
    } else {
      return temp;
    }
  } else {
    return str;
  }
};

export function separateRoutes(
  actions: EstimateSwapView[],
  outputToken: string
) {
  const res = [];
  let curRoute = [];

  for (let i in actions) {
    curRoute.push(actions[i]);
    if (actions[i].outputToken === outputToken) {
      res.push(curRoute);
      curRoute = [];
    }
  }

  return res;
}
export function calculateSmartRoutesV2PriceImpact(
  actions: any,
  outputToken: string
) {
  const routes = separateRoutes(actions, outputToken);

  const tokenIn = routes[0][0].token;

  const totalInputAmount = routes[0][0].totalInputAmount;

  const priceImpactForRoutes = routes.map((r, i) => {
    const readablePartialAmountIn = toReadableNumber(
      tokenIn.decimals,
      r[0].partialAmountIn
    );

    if (r.length > 1) {
      const tokenIn = r[0].tokens[0];
      const tokenMid = r[0].tokens[1];
      const tokenOut = r[0].tokens[2];

      return calculateSmartRoutingPriceImpact(
        readablePartialAmountIn,
        routes[i],
        tokenIn,
        tokenMid,
        tokenOut
      );
    } else {
      return isStablePool(r[0].pool.id)
        ? calcStableSwapPriceImpact(
            readablePartialAmountIn,
            r[0].noFeeAmountOut,
            (
              Number(r[0].pool.rates[outputToken]) /
              Number(r[0].pool.rates[tokenIn.id])
            ).toString()
          )
        : calculatePriceImpact(
            [r[0].pool],
            r[0].tokens[0],
            r[0].tokens[1],
            readablePartialAmountIn
          );
    }
  });

  const rawRes = priceImpactForRoutes.reduce(
    (pre, cur, i) => {
      return pre.plus(
        new Big(routes[i][0].partialAmountIn)
          .div(new Big(totalInputAmount))
          .mul(cur)
      );
    },

    new Big(0)
  );

  return scientificNotationToString(rawRes.toString());
}

export function getPoolAllocationPercents(pools: Pool[]) {
  if (pools.length === 1) return ['100'];

  if (pools) {
    const partialAmounts = pools.map((pool) => {
      return math.bignumber(pool.partialAmountIn);
    });

    const ps: string[] = new Array(partialAmounts.length).fill('0');

    const sum =
      partialAmounts.length === 1
        ? partialAmounts[0]
        : math.sum(...partialAmounts);

    const sortedAmount = sortBy(partialAmounts, (p) => Number(p));

    let minIndexes: number[] = [];

    for (let k = 0; k < sortedAmount.length - 1; k++) {
      let minIndex = -1;

      for (let j = 0; j < partialAmounts.length; j++) {
        if (partialAmounts[j].eq(sortedAmount[k]) && !minIndexes.includes(j)) {
          minIndex = j;
          minIndexes.push(j);
          break;
        }
      }
      const res = math
        .round(percent(partialAmounts[minIndex].toString(), sum))
        .toString();

      if (Number(res) === 0) {
        ps[minIndex] = '1';
      } else {
        ps[minIndex] = res;
      }
    }

    const finalPIndex = ps.indexOf('0');

    ps[finalPIndex] = subtraction(
      '100',
      ps.length === 1 ? Number(ps[0]) : math.sum(...ps.map((p) => Number(p)))
    ).toString();

    return ps;
  } else {
    return [];
  }
}
export function getRouteAllocationPercents(routes: IServerRoute[]) {
  if (routes.length === 1) return ['100'];

  if (routes) {
    const partialAmounts = routes.map((route) => {
      return math.bignumber(route.amount_in);
    });

    const ps: string[] = new Array(partialAmounts.length).fill('0');

    const sum =
      partialAmounts.length === 1
        ? partialAmounts[0]
        : math.sum(...partialAmounts);

    const sortedAmount = sortBy(partialAmounts, (p) => Number(p));

    const minIndexes: number[] = [];

    for (let k = 0; k < sortedAmount.length - 1; k++) {
      let minIndex = -1;

      for (let j = 0; j < partialAmounts.length; j++) {
        if (partialAmounts[j].eq(sortedAmount[k]) && !minIndexes.includes(j)) {
          minIndex = j;
          minIndexes.push(j);
          break;
        }
      }
      const res = math
        .round(percent(partialAmounts[minIndex].toString(), sum))
        .toString();

      if (Number(res) === 0) {
        ps[minIndex] = '1';
      } else {
        ps[minIndex] = res;
      }
    }

    const finalPIndex = ps.indexOf('0');

    ps[finalPIndex] = subtraction(
      '100',
      ps.length === 1 ? Number(ps[0]) : math.sum(...ps.map((p) => Number(p)))
    ).toString();

    return ps;
  } else {
    return [];
  }
}

export function getAllocationsLeastOne(arr: string[]) {
  if (arr.length === 0) return [];

  if (arr.length === 1) return ['100'];

  if (arr) {
    const partialAmounts = arr.map((v) => {
      return math.bignumber(v);
    });

    const ps: string[] = new Array(partialAmounts.length).fill('0');

    const sum =
      partialAmounts.length === 1
        ? partialAmounts[0]
        : math.sum(...partialAmounts);

    const sortedAmount = sortBy(partialAmounts, (p) => Number(p));

    let minIndexes: number[] = [];

    for (let k = 0; k < sortedAmount.length - 1; k++) {
      let minIndex = -1;

      for (let j = 0; j < partialAmounts.length; j++) {
        if (partialAmounts[j].eq(sortedAmount[k]) && !minIndexes.includes(j)) {
          minIndex = j;
          minIndexes.push(j);
          break;
        }
      }
      const res = math
        .round(percent(partialAmounts[minIndex].toString(), sum))
        .toString();

      if (Number(res) === 0) {
        ps[minIndex] = '1';
      } else {
        ps[minIndex] = res;
      }
    }

    const finalPIndex = ps.indexOf('0');

    ps[finalPIndex] = subtraction(
      '100',
      ps.length === 1 ? Number(ps[0]) : math.sum(...ps.map((p) => Number(p)))
    ).toString();

    return ps;
  } else {
    return [];
  }
}

export const checkAllocations = (sum: string, allocations: string[]) => {
  if (!allocations || allocations?.length === 0) return [];

  const sumNumber = new Big(sum);
  const sumAllocations = allocations.reduce((acc, cur, i) => {
    return acc.plus(new Big(cur));
  }, new Big(0));

  if (!sumAllocations.eq(sumNumber)) {
    const maxNum = _.maxBy(allocations, (o) => Number(o));

    const maxIndex = allocations.indexOf(maxNum);

    const leftSum = sumAllocations.minus(maxNum);
    const newMaxNum = sumNumber.minus(leftSum);

    return [
      ...allocations.slice(0, maxIndex),
      newMaxNum.toString(),
      ...allocations.slice(maxIndex + 1),
    ];
  } else return allocations;
};

export const getMax = function (
  id: string,
  max: string,
  token?: TokenMetadata
) {
  let condition;
  if (token) {
    condition = id == WRAP_NEAR_CONTRACT_ID && token.symbol == 'NEAR';
  } else {
    condition = id == WRAP_NEAR_CONTRACT_ID;
  }
  return !condition
    ? max
    : Number(max) <= 0.5
    ? '0'
    : toPrecision(
        scientificNotationToString(new Big(max).minus(0.5).toString()),
        24
      );
};

export const getMaxMin = function (
  id: string,
  max: string,
  token?: TokenMetadata
) {
  let condition;
  if (token) {
    condition = id == WRAP_NEAR_CONTRACT_ID && token.symbol == 'NEAR';
  } else {
    condition = id == WRAP_NEAR_CONTRACT_ID;
  }
  return !condition
    ? max
    : Number(max) <= 0.2
    ? '0'
    : toPrecision(
        scientificNotationToString(new Big(max).minus(0.2).toString()),
        24
      );
};

export const getPriceImpact = () => {};
