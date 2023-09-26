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
  } else if (big.lt(0.01)) {
    return '<0.01%';
  } else {
    return big.toFixed(2, 1) + '%';
  }
};
export const formatNumber = (v: string | number, type?: 'down' | 'both') => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.01';
  } else {
    return type == 'down' ? big.toFixed(2, 0) : big.toFixed(2, 1);
  }
};
export const formatWithCommas_number = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.01';
  } else {
    return formatWithCommas(big.toFixed(2, 1));
  }
};
export const formatPrice = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.0001)) {
    return '<0.0001';
  } else {
    return big.toFixed(4, 0);
  }
};
export const formatPriceWithCommas = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.0001)) {
    return '<0.0001';
  } else {
    const p = big.toFixed(4, 0);
    const [whole, decimal] = p.split('.');
    return `${formatWithCommas(whole)}${decimal ? '.' + decimal : ''}`;
  }
};
export const formatToInternationalCurrencySystem$ = (v: string | number) => {
  if (isInvalid(v)) return '$-';
  return '$' + toInternationalCurrencySystem(Big(v || 0).toFixed(), 2);
};
export const isInvalid = function (v: any) {
  if (v === '' || v === undefined || v === null || v === '-') return true;
  return false;
};

export function isValid(n: number) {
  if (n !== undefined && n !== null) return true;
  return false;
}
export function createRandomChar(c = 'a-z') {
  switch (c) {
    case 'A-Z':
      return String.fromCharCode(Math.trunc(Math.random() * 25) + 65);
    case 'a-z':
      return String.fromCharCode(Math.trunc(Math.random() * 25) + 97);
    case '0-9':
    default:
      return String.fromCharCode(Math.trunc(Math.random() * 10) + 48);
  }
}
export function createRandomString(length = 4) {
  let str = '';
  for (let i = 0; i < length; i++) str += createRandomChar();
  return str;
}
