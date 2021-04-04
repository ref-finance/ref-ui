import BN from 'bn.js';
import * as math from 'mathjs';

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
  if (!decimals) return number;
  const [wholePart, fracPart = ''] = number.split('.');

  return `${wholePart}${fracPart.padEnd(decimals, '0').slice(0, decimals)}`
    .replace(/^0+/, '')
    .padStart(1, '0');
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

export const calculateExchangeRate = (
  fee: number,
  from: string,
  to: string
) => {
  return math.round(
    math.evaluate(`${to} / (${from} - ${calculateFeeCharge(fee, from)})`),
    4
  );
};

export const percentOf = (percent: number, num: number | string) => {
  return math.evaluate(`${convertToPercentDecimal(percent)} * ${num}`);
};

export const percentLess = (percent: number, num: number | string) => {
  return math.evaluate(`${num} - ${percentOf(percent, num)}`);
};
