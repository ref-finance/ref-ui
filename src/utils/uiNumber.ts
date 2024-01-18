import Big from 'big.js';
import { formatWithCommas, toInternationalCurrencySystem } from './numbers';

export const formatWithCommas_usd = (v) => {
  if (isInvalid(v)) return '$-';
  const decimal = new Big(v);
  if (decimal.lte(0)) {
    return '$0';
  } else if (decimal.lt(0.01)) {
    return '<$0.01';
  } else if (decimal.lt(10000)) {
    return `$${formatWithCommas(decimal.toFixed(2))}`;
  } else {
    return `$${formatWithCommas(decimal.toFixed(0))}`;
  }
};
export const formatWithCommas_number = (v, d?: number | any) => {
  if (isInvalid(v)) return '-';
  const decimal = new Big(v);
  if (decimal.lte(0)) {
    return '0';
  } else if (decimal.lt(0.01)) {
    return '<0.01';
  } else {
    return `${formatWithCommas(decimal.toFixed(isInvalid(d) ? 2 : d))}`;
  }
};

export const toInternationalCurrencySystem_number = (v) => {
  if (isInvalid(v)) return '-';
  const decimal = new Big(v);
  if (decimal.lte(0)) {
    return '0';
  } else if (decimal.lt(0.01)) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystem(decimal.toFixed());
  }
};
export const toInternationalCurrencySystem_usd = (v) => {
  if (isInvalid(v)) return '$-';
  const decimal = new Big(v);
  if (decimal.lte(0)) {
    return '$0';
  } else if (decimal.lt(0.01)) {
    return '<$0.01';
  } else {
    return `$${toInternationalCurrencySystem(decimal.toFixed())}`;
  }
};

export const format_apy = (v) => {
  if (isInvalid(v)) return '-%';
  const decimal = new Big(v);
  if (decimal.lte(0)) {
    return '0%';
  } else if (decimal.lt(0.01) && decimal.gt(0)) {
    return '<0.01%';
  } else {
    return `${decimal.toFixed(2, 1)}%`;
  }
};

export function digitalProcess(v: string | number, precision: number = 2) {
  if (isInvalid(v)) return '-';
  let zero = '';
  for (let i = 0; i < precision - 1; i++) {
    zero += '0';
  }
  zero = `0.${zero}1`;
  const decimal = new Big(v);
  if (decimal.eq(0)) {
    return '0';
  } else if (decimal.lt(zero)) {
    return `<${zero}`;
  } else {
    return `${decimal.toFixed(precision)}`;
  }
}

export const formatPercentage = (v: string | number) => {
  if (isInvalid(v)) return '-%';
  const big = Big(v);
  if (big.lte(0)) {
    return '0%';
  } else if (big.lt(0.01)) {
    return '<0.01%';
  } else {
    return big.toFixed(2) + '%';
  }
};
export const formatPercentageUi = (v: string | number) => {
  if (isInvalid(v)) return '-%';
  const big = Big(v);
  if (big.lte(0)) {
    return '0%';
  } else if (big.lt(0.01)) {
    return '<0.01%';
  } else if (big.gte(999)) {
    return '999%';
  } else {
    return big.toFixed(2) + '%';
  }
};

export const isInvalid = (v) => {
  if (v === '' || v === undefined || v == null) return true;
  return false;
};

export const toBig = (v) => {
  return new Big(v).toFixed();
};
