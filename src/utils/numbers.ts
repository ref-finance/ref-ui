import BN from 'bn.js';
import * as math from 'mathjs';
import { TokenMetadata } from '~services/ft-contract';
import { Pool } from '~services/pool';

const BPS_CONVERSION = 10000;

const ROUNDING_OFFSETS: BN[] = [];
const BN10 = new BN(10);
for (let i = 0, offset = new BN(5); i < 24; i++, offset = offset.mul(BN10)) {
  ROUNDING_OFFSETS[i] = offset;
}

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
  return math.round(
    math.evaluate(`(${fee} / ${BPS_CONVERSION}) * ${total}`),
    2
  );
};

export const calculatePriceImpact = (
  pool: Pool,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  tokenInAmount: string
) => {
  const in_balance = toReadableNumber(
    tokenIn.decimals,
    pool.supplies[tokenIn.id]
  );
  const out_balance = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );

  const constant_product = math.evaluate(`${in_balance} * ${out_balance}`);

  const marketPrice = math.evaluate(`(${in_balance} / ${out_balance})`);

  const new_in_balance = math.evaluate(`${tokenInAmount} + ${in_balance}`);

  const new_out_balance = math.divide(constant_product, new_in_balance);

  const tokenOutReceived = math.subtract(
    math.evaluate(out_balance),
    new_out_balance
  );

  const newMarketPrice = math.evaluate(
    `${tokenInAmount} / ${tokenOutReceived}`
  );

  const PriceImpact = percent(
    subtraction(newMarketPrice, marketPrice),
    marketPrice
  ).toString();

  return PriceImpact;
};
export const calculateExchangeRate = (
  fee: number,
  from: string,
  to: string
) => {
  return math.round(math.evaluate(`${to} / ${from}`), 4);
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

export function formatWithCommas(value: string): string {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.replace(pattern, '$1,$2');
  }
  return value;
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
