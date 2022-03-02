import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import * as math from 'mathjs';
import { STABLE_LP_TOKEN_DECIMALS } from '../components/stableswap/AddLiquidity';
import { TokenMetadata } from '../services/ft-contract';
import { STABLE_POOL_ID, STABLE_TOKEN_IDS } from '../services/near';
import { Pool } from '../services/pool';
import { getSwappedAmount } from '../services/stable-swap';
import { EstimateSwapView } from '../services/swap';

const BPS_CONVERSION = 10000;
const REF_FI_STABLE_Pool_INFO_KEY = 'REF_FI_STABLE_Pool_INFO_VALUE';

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
  const isPool1StablePool = Number(STABLE_POOL_ID) === swapTodos[0].pool.id;
  const isPool2StablePool = Number(STABLE_POOL_ID) === swapTodos[1].pool.id;

  const marketPrice1 = isPool1StablePool
    ? '1'
    : calculateMarketPrice(swapTodos[0].pool, tokenIn, tokenMid);

  const marketPrice2 = isPool2StablePool
    ? '1'
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

  // const [amount_swapped, fee, dy] = getSwappedAmount(
  //   tokenIn.id,
  //   tokenOut.id,
  //   amountIn,
  //   stablePoolInfo
  // );

  let stableOutPool2;
  if (isPool2StablePool) {
    const stableOut = getSwappedAmount(
      tokenMid.id,
      tokenOut.id,
      formattedTokenMidReceived,
      JSON.parse(localStorage.getItem(REF_FI_STABLE_Pool_INFO_KEY))
    );
    stableOutPool2 =
      stableOut[0] < 0
        ? '0'
        : toPrecision(scientificNotationToString(stableOut[2].toString()), 0);
    stableOutPool2 = toReadableNumber(STABLE_LP_TOKEN_DECIMALS, stableOutPool2);
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

  const PriceImpact = percent(
    subtraction(newMarketPrice, generalMarketPrice),
    newMarketPrice
  ).toString();

  return scientificNotationToString(PriceImpact);
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
  to: string
) => {
  return math.floor(math.evaluate(`${to} / ${from}`), 4);
};

export const subtraction = (initialValue: string, toBeSubtract: string) => {
  return math.format(math.evaluate(`${initialValue} - ${toBeSubtract}`), {
    notation: 'fixed',
  });
};

export const percentOf = (percent: number, num: number | string) => {
  return math.evaluate(`${convertToPercentDecimal(percent)} * ${num}`);
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
  return Math.abs(Number(labelValue)) >= 1.0e9
    ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(percent || 2) + 'B'
    : Math.abs(Number(labelValue)) >= 1.0e6
    ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(percent || 2) + 'M'
    : Math.abs(Number(labelValue)) >= 1.0e3
    ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(percent || 2) + 'K'
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

export const calcStableSwapPriceImpact = (from: string, to: string) => {
  return math.format(percent(math.evaluate(`1 - (${to} / ${from})`), '1'), {
    notation: 'fixed',
  });
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
