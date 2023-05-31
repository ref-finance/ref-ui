import BigNumber from 'bignumber.js';
import { IAsset, IProtocolReward } from './burrow-interfaces';
import Big from 'big.js';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  formatWithCommas,
  toInternationalCurrencySystem,
} from '../utils/numbers';
import { getCurrentWallet } from '../utils/wallets-integration';
export const expandTokenDecimal = (
  value: string | number | BigNumber,
  decimals: string | number
): BigNumber => {
  return new BigNumber(value || 0).multipliedBy(
    new BigNumber(10).pow(decimals)
  );
};
export const expandToken = (
  value: string | number | BigNumber,
  decimals: number
): string => {
  return toNonDivisibleNumber(decimals, BigNumber(value || 0).toFixed());
};

export const shrinkToken = (
  value: string | number,
  decimals: number
): string => {
  return toReadableNumber(decimals, Big(value || 0).toFixed(0));
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
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (isInvalid(v)) return accountId ? '$0' : '$-';
  const big = Big(v);
  if (big.eq(0)) {
    return '$0';
  } else if (big.lt(0.01)) {
    return '<$0.01';
  } else if (big.lt(10000)) {
    return '$' + formatWithCommas(big.toFixed(2, 1));
  } else {
    return '$' + formatWithCommas(big.toFixed(0, 1));
  }
};

export const formatPercentage = (v: string | number) => {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (isInvalid(v)) return accountId ? '0%' : '-%';
  const big = Big(v);
  if (big.eq(0)) {
    return '0%';
  } else if (big.lt(0.01)) {
    return '<0.01%';
  } else {
    return big.toFixed(2, 1) + '%';
  }
};
export const formatNumber = (v: string | number) => {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (isInvalid(v)) return accountId ? '0' : '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.01';
  } else {
    return big.toFixed(2, 1);
  }
};
export const formatToInternationalCurrencySystem$ = (v: string | number) => {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (isInvalid(v)) return accountId ? '$0' : '$-';
  return '$' + toInternationalCurrencySystem(Big(v || 0).toFixed(), 2);
};
export const toAPY = (v: number) => Math.round(v * 100) / 100;
export function decimalMax(a: string | number, b: string | number) {
  const aBig = new Big(a);
  const bBig = new Big(b);
  return aBig.gt(bBig) ? aBig : bBig;
}

export function decimalMin(a: string | number, b: string | number) {
  const aBig = new Big(a);
  const bBig = new Big(b);
  return aBig.lt(bBig) ? aBig : bBig;
}
export const clone = (o: any) => JSON.parse(JSON.stringify(o));

export const isInvalid = function (v: any) {
  if (v == '' || v == undefined || v == null) return true;
  return false;
};
