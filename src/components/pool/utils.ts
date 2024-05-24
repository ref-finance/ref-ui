import Big from 'big.js';
import {
  formatWithCommas,
  toInternationalCurrencySystem,
  calculateFairShare,
  toRoundedReadableNumber,
} from '../../utils/numbers';
import { Pool } from 'src/services/pool';
import { TokenMetadata } from 'src/services/ft-contract';
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
export const formatWithCommas_usd_down = (v: string | number) => {
  if (isInvalid(v)) return '$-';
  const big = Big(v);
  if (big.eq(0)) {
    return '$0';
  } else if (big.lt(0.01)) {
    return '<$0.01';
  } else if (big.lt(10000)) {
    return '$' + formatWithCommas(big.toFixed(2, 0));
  } else {
    return '$' + formatWithCommas(big.toFixed(0, 0));
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
  if (v === '' || v === undefined || v === null) return true;
  return false;
};
export function secToTime(seconds) {
  const date = new Date(seconds * 1000);
  const year = date.getFullYear();
  let month: string | number = date.getMonth() + 1;
  let day: string | number = date.getDate();
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minute =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  // const second =
  //   date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  const currentTime =
    year + '/' + month + '/' + day + '  ' + hour + ':' + minute;
  // ':' +
  // second;
  return currentTime;
}

export const tokenAmountInShares = (
  pool: Pool,
  token: TokenMetadata,
  shares: string
) => {
  const value = toRoundedReadableNumber({
    decimals: token.decimals,
    number: calculateFairShare({
      shareOf: pool.supplies[token.id],
      contribution: shares,
      totalContribution: pool.shareSupply,
    }),
    precision: 3,
    withCommas: false,
  });

  return Number(value) == 0
    ? '0'
    : Number(value) < 0.001 && Number(value) > 0
    ? '< 0.001'
    : toInternationalCurrencySystem(value, 3);
};
