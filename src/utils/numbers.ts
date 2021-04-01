import BN from 'bn.js';
import * as math from 'mathjs';

const BPS_CONVERSION = 10000;

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

  const numberAsArray = number.split('');
  numberAsArray.splice(-decimals, 0, '.');
  return numberAsArray
    .join('')
    .replace(/\.([1-9]*)0*$/, '.$1')
    .replace(/\.$/, '');
};

export const toNonDivisibleNumber = (
  decimals: number,
  number: string
): string => {
  if (!decimals) return number;
  const [left, right = ''] = number.split('.');

  return `${left}${right.slice(0, decimals).padEnd(decimals, '0')}`;
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
