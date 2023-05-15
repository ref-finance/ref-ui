import BigNumber from 'bignumber.js';
import { IAsset, IProtocolReward } from './burrow-interfaces';
import Big from 'big.js';
import {
  toPrecision,
  toReadableNumber,
  formatWithCommas,
} from '../utils/numbers';
export const expandTokenDecimal = (
  value: string | number | BigNumber,
  decimals: string | number
): BigNumber => {
  return new BigNumber(value).multipliedBy(new BigNumber(10).pow(decimals));
};
export const expandToken = (
  value: string | number | BigNumber,
  decimals: string | number,
  fixed?: number
): string => {
  return expandTokenDecimal(value, decimals).toFixed(fixed);
};

export const shrinkToken = (
  value: string | number,
  decimals: string | number,
  fixed?: number
): string => {
  return new BigNumber(value)
    .div(new BigNumber(10).pow(decimals))
    .toFixed(fixed);
};

export const toUsd = (balance: string, asset: IAsset) =>
  asset.price?.usd
    ? Number(
        shrinkToken(
          balance,
          asset.metadata.decimals + asset.config.extra_decimals
        )
      ) * asset.price.usd
    : 0;
export const sumReducer = (sum: number, a: number) => sum + a;
export const sumRewards = (acc: number, r: IProtocolReward) =>
  acc + r.dailyAmount * r.price;

export const formatWithCommas_usd = (v: string | number) => {
  if (v == undefined || v == null || v == '') return '$-';
  const big = Big(v);
  if (big.eq(0)) {
    return '$0';
  } else if (big.lt(0.01)) {
    return '<$0.01';
  } else if (big.lt(10000)) {
    return '$' + formatWithCommas(big.toFixed(2));
  } else {
    return '$' + formatWithCommas(big.toFixed(0));
  }
};

export const formatPercentage = (v: string | number) => {
  if (v == undefined || v == null || v == '') return '-%';
  const big = Big(v);
  if (big.eq(0)) {
    return '0%';
  } else if (big.lt(0.01)) {
    return '<0.01%';
  } else {
    return big.toFixed(2) + '%';
  }
};
export const formatNumber = (v: string | number) => {
  if (v == undefined || v == null || v == '') return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.01';
  } else {
    return big.toFixed(2);
  }
};
export const toAPY = (v: number) => Math.round(v * 100) / 100;
