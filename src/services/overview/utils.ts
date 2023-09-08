import Big from 'big.js';
import { getCurrentWallet } from '../../utils/wallets-integration';
import {
  toReadableNumber,
  formatWithCommas,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
export const formatWithCommas_usd = (v: string | number) => {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (isInvalid(v) || !accountId) return accountId ? '$0' : '$-';
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
export const formatWithCommas_usd_down = (v: string | number) => {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (isInvalid(v) || !accountId) return accountId ? '$0' : '$-';
  const big = Big(v);
  if (big.eq(0)) {
    return '$0';
  } else if (big.lt(0.01)) {
    return '<$0.01';
  } else {
    return '$' + formatWithCommas(big.toFixed(2, 0));
  }
};

export const formatPercentage = (v: string | number) => {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (isInvalid(v) || !accountId) return accountId ? '0%' : '-%';
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
  if (isInvalid(v) || !accountId) return accountId ? '0' : '-';
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
  if (isInvalid(v) || !accountId) return accountId ? '$0' : '$-';
  return '$' + toInternationalCurrencySystem(Big(v || 0).toFixed(), 2);
};
export const isInvalid = function (v: any) {
  if (v == '' || v == undefined || v == null) return true;
  return false;
};
export const sumReducer = (sum: number, a: number) => sum + a;
export const shrinkToken = (
  value: string | number,
  decimals: number
): string => {
  return toReadableNumber(decimals, Big(value || 0).toFixed(0, 1));
};
