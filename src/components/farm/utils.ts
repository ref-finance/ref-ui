import Big from 'big.js';
import {
  formatWithCommas,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
export const formatWithCommas_usd = (v: string | number) => {
  if (isInvalid(v)) return '$-';
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
  if (isInvalid(v)) return '-%';
  const big = Big(v);
  if (big.eq(0)) {
    return '0%';
  } else if (big.lt(1)) {
    return '<1%';
  } else {
    return big.toFixed(0, 1) + '%';
  }
};
export const formatNumber = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.01';
  } else {
    return big.toFixed(2, 1);
  }
};
export const formatPrice = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.0001';
  } else {
    return big.toFixed(4, 1);
  }
};
export const formatToInternationalCurrencySystem$ = (v: string | number) => {
  if (isInvalid(v)) return '$-';
  return '$' + toInternationalCurrencySystem(Big(v || 0).toFixed(), 2);
};
export const isInvalid = function (v: any) {
  if (v === '' || v === undefined || v === null) return true;
  return false;
};
